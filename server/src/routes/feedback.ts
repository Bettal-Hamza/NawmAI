import { FastifyInstance } from 'fastify';
import { createFeedback } from '../db/queries';
import { isValidUUID, isValidRating } from '../utils/validation';

export const feedbackRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/api/feedback', async (request, reply) => {
    const { userId, message, rating } = request.body as {
      userId: string;
      message: string;
      rating: number;
    };

    if (!userId || !message || !rating) {
      return reply.status(400).send({ error: 'userId, message, and rating are required' });
    }

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    if (message.length > 1000) {
      return reply.status(400).send({ error: 'Message must be 1000 characters or less' });
    }

    if (!isValidRating(rating)) {
      return reply.status(400).send({ error: 'Rating must be between 1 and 5' });
    }

    try {
      const feedback = await createFeedback(userId, message.trim(), rating);
      return reply.status(201).send(feedback);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to submit feedback' });
    }
  });
};
