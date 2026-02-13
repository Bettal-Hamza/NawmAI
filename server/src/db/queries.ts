import pool from './pool';

// ============ USERS ============

export const createUser = async (name: string, email: string, age?: number) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, age) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = $1, age = $3
     RETURNING *`,
    [name, email, age || null]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const getUserById = async (id: string) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

// ============ SLEEP PROFILES ============

export const createSleepProfile = async (
  userId: string,
  bedtimeGoal: string,
  wakeupGoal: string,
  sleepChallenges: string[]
) => {
  const result = await pool.query(
    `INSERT INTO sleep_profiles (user_id, bedtime_goal, wakeup_goal, sleep_challenges)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, bedtimeGoal, wakeupGoal, sleepChallenges]
  );
  return result.rows[0];
};

export const getSleepProfile = async (userId: string) => {
  const result = await pool.query(
    'SELECT * FROM sleep_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

// ============ SLEEP CHECK-INS ============

/** Compute sleep duration in hours from HH:MM strings (handles midnight crossing) */
const computeSleepHours = (bedtime: string, wakeup: string): number => {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeup.split(':').map(Number);
  let bed = bh * 60 + bm;
  let wake = wh * 60 + wm;
  if (wake <= bed) wake += 24 * 60;
  return Math.round(((wake - bed) / 60) * 100) / 100;
};

export const createCheckin = async (
  userId: string,
  checkinDate: string,
  bedtime: string,
  wakeupTime: string,
  sleepQuality: number,
  mood: number,
  notes?: string,
  phoneBeforeBed?: boolean
) => {
  const sleepHours = computeSleepHours(bedtime, wakeupTime);
  const result = await pool.query(
    `INSERT INTO sleep_checkins
       (user_id, checkin_date, bedtime, wakeup_time, sleep_quality, mood, notes, phone_before_bed, sleep_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id, checkin_date) DO UPDATE
     SET bedtime = $3, wakeup_time = $4, sleep_quality = $5, mood = $6,
         notes = $7, phone_before_bed = $8, sleep_hours = $9
     RETURNING *`,
    [userId, checkinDate, bedtime, wakeupTime, sleepQuality, mood, notes || null, phoneBeforeBed ?? false, sleepHours]
  );
  return result.rows[0];
};

export const getCheckins = async (userId: string, limit = 7) => {
  const result = await pool.query(
    `SELECT * FROM sleep_checkins WHERE user_id = $1
     ORDER BY checkin_date DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const getWeeklySummary = async (userId: string) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total_checkins,
       ROUND(AVG(sleep_quality)::numeric, 1)::float AS avg_quality,
       ROUND(AVG(mood)::numeric, 1)::float AS avg_mood,
       ROUND(AVG(sleep_hours)::numeric, 1)::float AS avg_sleep_hours,
       MIN(bedtime) AS earliest_bedtime,
       MAX(bedtime) AS latest_bedtime,
       MIN(wakeup_time) AS earliest_wakeup,
       MAX(wakeup_time) AS latest_wakeup,
       COUNT(*) FILTER (WHERE phone_before_bed = true)::int AS phone_nights,
       ROUND(AVG(sleep_quality) FILTER (WHERE phone_before_bed = true)::numeric, 1)::float AS avg_quality_phone,
       ROUND(AVG(sleep_quality) FILTER (WHERE phone_before_bed = false)::numeric, 1)::float AS avg_quality_no_phone
     FROM sleep_checkins
     WHERE user_id = $1
       AND checkin_date >= (CURRENT_DATE - INTERVAL '7 days')::date`,
    [userId]
  );
  return result.rows[0];
};

/** Get all check-ins from the last 7 days (full rows for AI processing) */
export const getWeeklyCheckins = async (userId: string) => {
  const result = await pool.query(
    `SELECT * FROM sleep_checkins
     WHERE user_id = $1 AND checkin_date >= (CURRENT_DATE - INTERVAL '7 days')::date
     ORDER BY checkin_date DESC`,
    [userId]
  );
  return result.rows;
};

/** Get previous week's summary for trend comparison */
export const getPreviousWeekSummary = async (userId: string) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS total_checkins,
       ROUND(AVG(sleep_quality)::numeric, 1)::float AS avg_quality,
       ROUND(AVG(mood)::numeric, 1)::float AS avg_mood,
       ROUND(AVG(sleep_hours)::numeric, 1)::float AS avg_sleep_hours
     FROM sleep_checkins
     WHERE user_id = $1
       AND checkin_date >= (CURRENT_DATE - INTERVAL '14 days')::date
       AND checkin_date < (CURRENT_DATE - INTERVAL '7 days')::date`,
    [userId]
  );
  return result.rows[0];
};

// Fallback: get ALL check-ins count (used if weekly is empty)
export const getTotalCheckinCount = async (userId: string) => {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM sleep_checkins WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.count || 0;
};

// ============ FEEDBACK ============

export const createFeedback = async (userId: string, message: string, rating: number) => {
  const result = await pool.query(
    `INSERT INTO feedback (user_id, message, rating) VALUES ($1, $2, $3) RETURNING *`,
    [userId, message, rating]
  );
  return result.rows[0];
};

// ============ WEEKLY REPORTS ============

export const saveWeeklyReport = async (
  userId: string,
  reportText: string,
  stats: object,
  weekStart: string,
  weekEnd: string
) => {
  const result = await pool.query(
    `INSERT INTO weekly_reports (user_id, report_text, stats, week_start, week_end)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, reportText, JSON.stringify(stats), weekStart, weekEnd]
  );
  return result.rows[0];
};

export const getReportForDate = async (userId: string, date: string) => {
  const result = await pool.query(
    `SELECT * FROM weekly_reports
     WHERE user_id = $1 AND $2::date BETWEEN week_start AND week_end
     ORDER BY created_at DESC LIMIT 1`,
    [userId, date]
  );
  return result.rows[0] || null;
};

export const getLatestReport = async (userId: string) => {
  const result = await pool.query(
    `SELECT * FROM weekly_reports WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
};
