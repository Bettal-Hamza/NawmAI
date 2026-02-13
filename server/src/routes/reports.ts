import { FastifyInstance } from 'fastify';
import {
  getWeeklySummary, getSleepProfile, getUserById, getTotalCheckinCount,
  getCheckins, saveWeeklyReport, getReportForDate, getLatestReport,
  getWeeklyCheckins, getPreviousWeekSummary,
} from '../db/queries';
import { generateWeeklyReport, type StructuredWeeklyReport } from '../services/ai';
import { isValidUUID } from '../utils/validation';

export const reportRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/api/reports/:userId/weekly', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { regenerate } = request.query as { regenerate?: string };

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const [user, profile, stats] = await Promise.all([
        getUserById(userId),
        getSleepProfile(userId),
        getWeeklySummary(userId),
      ]);

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      if (!profile) {
        return reply.status(404).send({ error: 'No sleep profile found. Complete onboarding first.' });
      }

      const weeklyCount = Number(stats?.total_checkins) || 0;

      if (weeklyCount === 0) {
        const totalCount = await getTotalCheckinCount(userId);
        if (totalCount === 0) {
          return reply.status(404).send({
            error: 'No check-ins found. Log your first sleep entry to get a report.',
          });
        }
      }

      if (regenerate !== 'true') {
        const existing = await getLatestReport(userId);
        if (existing) {
          const reportAge = Date.now() - new Date(existing.created_at).getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (reportAge < oneDayMs) {
            const parsed = typeof existing.stats === 'string' ? JSON.parse(existing.stats) : existing.stats;
            const isStructured = parsed.sleep_score !== undefined || existing.report_text.startsWith('{');
            let structuredReport: StructuredWeeklyReport;
            try {
              structuredReport = isStructured
                ? (existing.report_text.startsWith('{') ? JSON.parse(existing.report_text) : parsed)
                : JSON.parse(existing.report_text);
            } catch {
              structuredReport = {
                sleep_score: 0,
                sleep_score_label: 'N/A',
                key_wins: [],
                pattern_insights: [],
                focus_recommendation: '',
                coach_note: existing.report_text,
              };
            }

            return reply.send({
              report: structuredReport,
              stats: parsed,
              weekStart: existing.week_start,
              weekEnd: existing.week_end,
              generatedAt: existing.created_at,
              cached: true,
            });
          }
        }
      }

      const [weeklyCheckins, prevStats] = await Promise.all([
        getWeeklyCheckins(userId),
        getPreviousWeekSummary(userId),
      ]);

      let finalStats = stats;
      let checkins = weeklyCheckins;

      if (weeklyCount === 0) {
        checkins = await getCheckins(userId, 7);
        if (checkins.length > 0) {
          const avgQuality = checkins.reduce((s: number, c: any) => s + c.sleep_quality, 0) / checkins.length;
          const avgMood = checkins.reduce((s: number, c: any) => s + c.mood, 0) / checkins.length;
          const avgHours = checkins.reduce((s: number, c: any) => s + (parseFloat(c.sleep_hours) || 0), 0) / checkins.length;
          const phoneNights = checkins.filter((c: any) => c.phone_before_bed).length;

          finalStats = {
            total_checkins: checkins.length,
            avg_quality: Math.round(avgQuality * 10) / 10,
            avg_mood: Math.round(avgMood * 10) / 10,
            avg_sleep_hours: Math.round(avgHours * 10) / 10,
            earliest_bedtime: checkins.map((c: any) => c.bedtime).sort()[0],
            latest_bedtime: checkins.map((c: any) => c.bedtime).sort().pop(),
            earliest_wakeup: checkins.map((c: any) => c.wakeup_time).sort()[0],
            latest_wakeup: checkins.map((c: any) => c.wakeup_time).sort().pop(),
            phone_nights: phoneNights,
            avg_quality_phone: null,
            avg_quality_no_phone: null,
          };
        }
      }

      const isPartial = Number(finalStats.total_checkins) < 5;

      const report = await generateWeeklyReport(user.name, finalStats, profile, prevStats, checkins);

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = today.toISOString().split('T')[0];

      await saveWeeklyReport(userId, JSON.stringify(report), finalStats, weekStartStr, weekEndStr);

      return reply.send({
        report,
        stats: finalStats,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        generatedAt: new Date().toISOString(),
        isPartial,
        cached: false,
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to generate report' });
    }
  });

  fastify.get('/api/reports/:userId/by-date', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { date } = request.query as { date: string };

    if (!isValidUUID(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    if (!date) {
      return reply.status(400).send({ error: 'Date query parameter is required' });
    }

    try {
      const saved = await getReportForDate(userId, date);

      if (!saved) {
        return reply.status(404).send({ error: 'No report found for this date' });
      }

      let report: StructuredWeeklyReport;
      try {
        report = JSON.parse(saved.report_text);
      } catch {
        report = {
          sleep_score: 0,
          sleep_score_label: 'N/A',
          key_wins: [],
          pattern_insights: [],
          focus_recommendation: '',
          coach_note: saved.report_text,
        };
      }

      return reply.send({
        report,
        stats: saved.stats,
        weekStart: saved.week_start,
        weekEnd: saved.week_end,
        generatedAt: saved.created_at,
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to get report' });
    }
  });
};
