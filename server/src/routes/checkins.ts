import { FastifyInstance } from 'fastify';
import { createCheckin, getCheckins, getWeeklySummary, getSleepProfile } from '../db/queries';
import { isValidUUID, isValidTime, isValidRating, isValidDate } from '../utils/validation';
import { generateDailyFeedback } from '../services/ai';

export const checkinRoutes = async (fastify: FastifyInstance) => {
  // Submit daily check-in
  fastify.post('/api/checkins', async (request, reply) => {
    const { userId, checkinDate, bedtime, wakeupTime, sleepQuality, mood, notes, phoneBeforeBed } = request.body as {
      userId: string;
      checkinDate: string;
      bedtime: string;
      wakeupTime: string;
      sleepQuality: number;
      mood: number;
      notes?: string;
      phoneBeforeBed?: boolean;
    };

    // Validate required fields
    if (!userId || !checkinDate || !bedtime || !wakeupTime || !sleepQuality || !mood) {
      return reply.status(400).send({ error: 'All fields except notes are required' });
    }

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    if (!isValidDate(checkinDate)) {
      return reply.status(400).send({ error: 'Invalid date format' });
    }

    if (!isValidTime(bedtime) || !isValidTime(wakeupTime)) {
      return reply.status(400).send({ error: 'Times must be in HH:MM format' });
    }

    if (!isValidRating(sleepQuality) || !isValidRating(mood)) {
      return reply.status(400).send({ error: 'Quality and mood must be between 1 and 5' });
    }

    try {
      const checkin = await createCheckin(
        userId, checkinDate, bedtime, wakeupTime, sleepQuality, mood, notes, phoneBeforeBed
      );

      // Generate optional daily feedback (non-blocking — don't fail the check-in if this errors)
      let dailyFeedback = '';
      try {
        const profile = await getSleepProfile(userId);
        dailyFeedback = await generateDailyFeedback(
          {
            sleep_hours: parseFloat(checkin.sleep_hours),
            sleep_quality: checkin.sleep_quality,
            mood: checkin.mood,
            phone_before_bed: checkin.phone_before_bed,
            notes: checkin.notes,
          },
          profile
        );
      } catch (feedbackErr: any) {
        fastify.log.warn('Daily feedback generation failed (non-critical): ' + (feedbackErr?.message || ''));
      }

      return reply.status(201).send({ ...checkin, dailyFeedback });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to save check-in', details: err.message });
    }
  });

  // Get recent check-ins
  fastify.get('/api/checkins/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { limit } = request.query as { limit?: string };

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const checkins = await getCheckins(userId, limit ? parseInt(limit) : 7);
      return reply.send(checkins);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to get check-ins' });
    }
  });

  // Get weekly summary stats
  fastify.get('/api/checkins/:userId/summary', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const summary = await getWeeklySummary(userId);
      return reply.send(summary);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to get summary' });
    }
  });
};
