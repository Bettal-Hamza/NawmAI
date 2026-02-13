import { FastifyInstance } from 'fastify';
import { createSleepProfile, getSleepProfile } from '../db/queries';
import { isValidUUID, isValidTime } from '../utils/validation';

export const profileRoutes = async (fastify: FastifyInstance) => {
  // Create sleep profile (onboarding)
  fastify.post('/api/sleep-profiles', async (request, reply) => {
    const { userId, bedtimeGoal, wakeupGoal, sleepChallenges } = request.body as {
      userId: string;
      bedtimeGoal: string;
      wakeupGoal: string;
      sleepChallenges: string[];
    };

    // Validate
    if (!userId || !bedtimeGoal || !wakeupGoal) {
      return reply.status(400).send({ error: 'userId, bedtimeGoal, and wakeupGoal are required' });
    }

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    if (!isValidTime(bedtimeGoal) || !isValidTime(wakeupGoal)) {
      return reply.status(400).send({ error: 'Times must be in HH:MM format' });
    }

    try {
      const profile = await createSleepProfile(
        userId,
        bedtimeGoal,
        wakeupGoal,
        sleepChallenges || []
      );
      return reply.status(201).send(profile);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to create sleep profile' });
    }
  });

  // Get sleep profile
  fastify.get('/api/sleep-profiles/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const profile = await getSleepProfile(userId);
      if (!profile) {
        return reply.status(404).send({ error: 'Sleep profile not found' });
      }
      return reply.send(profile);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to get sleep profile' });
    }
  });
};
