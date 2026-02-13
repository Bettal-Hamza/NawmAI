import { FastifyInstance } from 'fastify';
import { createUser, getUserByEmail } from '../db/queries';
import { isValidEmail } from '../utils/validation';

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/api/users', async (request, reply) => {
    const { name, email, age } = request.body as {
      name: string;
      email: string;
      age?: number;
    };

    if (!name || !email) {
      return reply.status(400).send({ error: 'Name and email are required' });
    }

    if (!isValidEmail(email)) {
      return reply.status(400).send({ error: 'Invalid email format' });
    }

    if (name.length > 100) {
      return reply.status(400).send({ error: 'Name must be 100 characters or less' });
    }

    try {
      const user = await createUser(name.trim(), email.toLowerCase().trim(), age);
      return reply.status(201).send(user);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  fastify.get('/api/users/:email', async (request, reply) => {
    const { email } = request.params as { email: string };

    if (!isValidEmail(email)) {
      return reply.status(400).send({ error: 'Invalid email format' });
    }

    try {
      const user = await getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      return reply.send(user);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to get user' });
    }
  });
};
