/**
 * Sleep utility functions for NawmAI
 * Computes score, streak, debt, and missions from check-in data.
 */

interface Checkin {
  id: string;
  checkin_date: string;
  bedtime: string;
  wakeup_time: string;
  sleep_quality: number;
  mood: number;
}

interface SleepProfile {
  bedtime_goal: string;
  wakeup_goal: string;
  sleep_challenges: string[];
}

// ============ SLEEP SCORE (0–100) ============

/**
 * Computes a single sleep score from the most recent check-in.
 * Formula: quality (40%) + mood (30%) + consistency bonus (30%)
 * Consistency = how close bedtime was to the goal.
 */
export const computeSleepScore = (
  checkin: Checkin,
  profile: SleepProfile | null
): number => {
  // Quality: 1-5 → 0-40
  const qualityScore = ((checkin.sleep_quality - 1) / 4) * 40;

  // Mood: 1-5 → 0-30
  const moodScore = ((checkin.mood - 1) / 4) * 30;

  // Consistency: how close bedtime is to goal → 0-30
  let consistencyScore = 15; // default if no profile
  if (profile?.bedtime_goal) {
    const diff = Math.abs(timeToMinutes(checkin.bedtime) - timeToMinutes(profile.bedtime_goal));
    // 0 diff = 30pts, 60+ min diff = 0pts
    consistencyScore = Math.max(0, 30 - (diff / 2));
  }

  return Math.round(qualityScore + moodScore + consistencyScore);
};

/**
 * Average sleep score for the week.
 */
export const computeWeeklyScore = (
  checkins: Checkin[],
  profile: SleepProfile | null
): number => {
  if (checkins.length === 0) return 0;
  const total = checkins.reduce((sum, c) => sum + computeSleepScore(c, profile), 0);
  return Math.round(total / checkins.length);
};

// ============ CHECK-IN STREAK ============

/**
 * Counts consecutive days of check-ins ending at today (or the most recent).
 * Checkins must be sorted by date DESC.
 */
export const computeStreak = (checkins: Checkin[]): number => {
  if (checkins.length === 0) return 0;

  const dates = checkins.map((c) => normalizeDate(c.checkin_date));
  let streak = 1;
  const today = normalizeDate(new Date().toISOString());

  // If most recent check-in isn't today or yesterday, streak is 0
  const daysSinceLast = daysBetween(dates[0], today);
  if (daysSinceLast > 1) return 0;

  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i], dates[i - 1]);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak tonight!';
  if (streak === 1) return 'Day 1 — great start!';
  if (streak < 4) return `${streak}-day streak — keep going!`;
  if (streak < 7) return `${streak}-day streak — almost a full week!`;
  if (streak === 7) return '7-day streak — perfect week!';
  return `${streak}-day streak — incredible!`;
};

// ============ SLEEP DEBT ============

/**
 * Calculates weekly sleep debt in hours.
 * Positive = debt (under-sleeping), Negative = surplus.
 */
export const computeSleepDebt = (
  checkins: Checkin[],
  profile: SleepProfile | null
): number => {
  if (!profile || checkins.length === 0) return 0;

  const goalHours = hoursOfSleep(profile.bedtime_goal, profile.wakeup_goal);
  let totalDebt = 0;

  for (const c of checkins) {
    const actual = hoursOfSleep(c.bedtime, c.wakeup_time);
    totalDebt += goalHours - actual;
  }

  return Math.round(totalDebt * 10) / 10; // one decimal
};

// ============ NIGHTLY MISSIONS ============

interface Mission {
  id: string;
  text: string;
  icon: string; // icon name for react-icons
}

/**
 * Generates 3 personalized nightly missions based on user challenges.
 */
export const generateMissions = (profile: SleepProfile | null): Mission[] => {
  const challenges = profile?.sleep_challenges || [];
  const missions: Mission[] = [];

  // Always include a bedtime mission
  if (profile?.bedtime_goal) {
    missions.push({
      id: 'bedtime',
      text: `Get in bed by ${profile.bedtime_goal} tonight`,
      icon: 'clock',
    });
  }

  // Challenge-specific missions
  const challengeMissions: Record<string, Mission> = {
    phone: { id: 'phone', text: 'Put your phone away 30 min before bed', icon: 'phone' },
    stress: { id: 'stress', text: 'Do 5 minutes of deep breathing tonight', icon: 'wind' },
    caffeine: { id: 'caffeine', text: 'No caffeine after 3 PM today', icon: 'coffee' },
    irregular: { id: 'irregular', text: 'Stick to your sleep schedule tonight', icon: 'refresh' },
    noise: { id: 'noise', text: 'Prepare a quiet sleep environment', icon: 'volume' },
    naps: { id: 'naps', text: 'Skip any naps today (or keep under 20 min)', icon: 'moon' },
  };

  for (const ch of challenges) {
    if (challengeMissions[ch] && missions.length < 3) {
      missions.push(challengeMissions[ch]);
    }
  }

  // Fill remaining slots with general tips
  const generalMissions: Mission[] = [
    { id: 'water', text: 'Drink a glass of water before bed', icon: 'droplet' },
    { id: 'screen', text: 'Dim your screen 1 hour before sleep', icon: 'sun' },
    { id: 'journal', text: 'Write down one thing you\'re grateful for', icon: 'edit' },
  ];

  for (const m of generalMissions) {
    if (missions.length < 3 && !missions.find((e) => e.id === m.id)) {
      missions.push(m);
    }
  }

  return missions.slice(0, 3);
};

// ============ 7-DAY TREND DATA ============

export interface TrendPoint {
  day: string; // e.g. "Mon"
  date: string; // e.g. "Feb 10"
  quality: number; // 1-5
  score: number; // 0-100
}

/**
 * Builds an array of 7 trend points for the chart (oldest → newest).
 */
export const buildTrendData = (
  checkins: Checkin[],
  profile: SleepProfile | null
): TrendPoint[] => {
  // checkins are sorted DESC, reverse for chart
  const sorted = [...checkins].reverse().slice(-7);

  return sorted.map((c) => {
    const d = new Date(c.checkin_date);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quality: c.sleep_quality,
      score: computeSleepScore(c, profile),
    };
  });
};

// ============ HELPERS ============

/** Convert "HH:MM" to minutes since midnight */
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Calculate hours of sleep between bedtime and wakeup (handles crossing midnight) */
const hoursOfSleep = (bedtime: string, wakeup: string): number => {
  let bed = timeToMinutes(bedtime);
  let wake = timeToMinutes(wakeup);
  if (wake <= bed) wake += 24 * 60; // crossed midnight
  return (wake - bed) / 60;
};

/** Normalize a date string to YYYY-MM-DD */
const normalizeDate = (dateStr: string): string => {
  return dateStr.split('T')[0];
};

/** Days between two YYYY-MM-DD strings (absolute) */
const daysBetween = (earlier: string, later: string): number => {
  const a = new Date(earlier + 'T00:00:00');
  const b = new Date(later + 'T00:00:00');
  return Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};
