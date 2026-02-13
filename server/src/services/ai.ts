import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groq: Groq | null = null;

const getGroqClient = (): Groq => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

interface WeeklyStats {
  total_checkins: number;
  avg_quality: number;
  avg_mood: number;
  avg_sleep_hours: number;
  earliest_bedtime: string;
  latest_bedtime: string;
  earliest_wakeup: string;
  latest_wakeup: string;
  phone_nights: number;
  avg_quality_phone: number | null;
  avg_quality_no_phone: number | null;
}

interface PrevWeekStats {
  total_checkins: number;
  avg_quality: number;
  avg_mood: number;
  avg_sleep_hours: number;
}

interface SleepProfile {
  bedtime_goal: string;
  wakeup_goal: string;
  sleep_challenges: string[];
}

export interface StructuredWeeklyReport {
  sleep_score: number;
  sleep_score_label: string;
  key_wins: string[];
  pattern_insights: string[];
  focus_recommendation: string;
  coach_note: string;
}

export const generateDailyFeedback = async (
  checkin: {
    sleep_hours: number;
    sleep_quality: number;
    mood: number;
    phone_before_bed: boolean;
    notes?: string;
  },
  profile: SleepProfile | null
): Promise<string> => {
  const prompt = `You are a friendly sleep coach for students. Write EXACTLY 2 short sentences.
Sentence 1: One observation about this night's sleep.
Sentence 2: One small, actionable tip for tonight.

Data:
- Slept ${checkin.sleep_hours} hours
- Sleep quality: ${checkin.sleep_quality}/5
- Mood: ${checkin.mood}/5
- Used phone before bed: ${checkin.phone_before_bed ? 'yes' : 'no'}
${checkin.notes ? `- Notes: "${checkin.notes}"` : ''}
${profile ? `- Bedtime goal: ${profile.bedtime_goal}` : ''}
${profile?.sleep_challenges?.length ? `- Challenges: ${profile.sleep_challenges.join(', ')}` : ''}

Rules:
- Max 2 sentences total
- Friendly, warm tone
- No medical language
- Be specific to the data above`;

  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || '';
};

const extractNoteKeywords = (checkins: any[]): string[] => {
  const keywords: Record<string, number> = {};
  const stopWords = new Set(['i', 'a', 'the', 'was', 'had', 'my', 'to', 'and', 'it', 'but', 'so', 'in', 'of', 'for', 'on', 'is', 'at', 'this', 'that', 'with']);

  for (const c of checkins) {
    if (!c.notes) continue;
    const words = c.notes.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    for (const w of words) {
      if (w.length > 2 && !stopWords.has(w)) {
        keywords[w] = (keywords[w] || 0) + 1;
      }
    }
  }

  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const trendLabel = (current: number | null, previous: number | null): string => {
  if (current == null || previous == null) return 'no data';
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return 'stable';
  return diff > 0 ? `improved (+${diff.toFixed(1)})` : `declined (${diff.toFixed(1)})`;
};

export const generateWeeklyReport = async (
  userName: string,
  stats: WeeklyStats,
  profile: SleepProfile,
  prevStats: PrevWeekStats | null,
  checkins: any[]
): Promise<StructuredWeeklyReport> => {
  const noteKeywords = extractNoteKeywords(checkins);
  const qualityTrend = trendLabel(stats.avg_quality, prevStats?.avg_quality ?? null);
  const moodTrend = trendLabel(stats.avg_mood, prevStats?.avg_mood ?? null);
  const hoursTrend = trendLabel(stats.avg_sleep_hours, prevStats?.avg_sleep_hours ?? null);

  let phoneInsight = 'No phone data available';
  if (stats.phone_nights > 0 && stats.avg_quality_no_phone != null) {
    const diff = (stats.avg_quality_no_phone || 0) - (stats.avg_quality_phone || 0);
    if (diff > 0.3) phoneInsight = `Sleep quality is ${diff.toFixed(1)} points higher on nights without phone use`;
    else if (diff < -0.3) phoneInsight = 'Phone use before bed did not seem to affect quality this week';
    else phoneInsight = 'No significant difference between phone/no-phone nights';
  }

  const prompt = `You are a friendly, data-driven sleep coach for students and young professionals.
Analyze the following pre-computed sleep data and return a structured JSON report.

USER: ${userName}
GOALS: Bedtime ${profile.bedtime_goal}, Wake-up ${profile.wakeup_goal}
CHALLENGES: ${profile.sleep_challenges?.join(', ') || 'none'}

THIS WEEK (${stats.total_checkins} check-ins):
- Avg sleep: ${stats.avg_sleep_hours ?? 'n/a'} hours
- Avg quality: ${stats.avg_quality}/5
- Avg mood: ${stats.avg_mood}/5
- Bedtime range: ${stats.earliest_bedtime} – ${stats.latest_bedtime}
- Wake range: ${stats.earliest_wakeup} – ${stats.latest_wakeup}
- Phone before bed: ${stats.phone_nights}/${stats.total_checkins} nights

TRENDS vs last week:
- Quality: ${qualityTrend}
- Mood: ${moodTrend}
- Sleep hours: ${hoursTrend}

PHONE CORRELATION: ${phoneInsight}
NOTE KEYWORDS: ${noteKeywords.length > 0 ? noteKeywords.join(', ') : 'none'}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "sleep_score": <number 0-100>,
  "sleep_score_label": "<Excellent|Good|Fair|Poor>",
  "key_wins": ["<positive habit 1>", "<positive habit 2>"],
  "pattern_insights": ["<behavior correlation 1>", "<pattern 2>"],
  "focus_recommendation": "<one main actionable recommendation>",
  "coach_note": "<2-3 sentence motivational summary comparing to last week>"
}

Rules:
- sleep_score: base on quality (40%), consistency (30%), sleep hours vs 8h goal (30%)
- key_wins: 1-3 positive observations. Be specific.
- pattern_insights: 1-3 data-backed correlations. Reference phone data if relevant.
- focus_recommendation: One clear, simple action for next week.
- coach_note: Warm, encouraging. Compare progress to last week. No medical claims.
- All text must be short and scannable (bullet-point friendly).`;

  const response = await getGroqClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a sleep coaching AI. Return only valid JSON. No markdown. No explanation.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('No response from AI');

  const cleanJson = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleanJson) as StructuredWeeklyReport;

    parsed.sleep_score = Math.max(0, Math.min(100, Math.round(parsed.sleep_score)));
    if (!parsed.sleep_score_label) {
      parsed.sleep_score_label = parsed.sleep_score >= 80 ? 'Excellent' : parsed.sleep_score >= 60 ? 'Good' : parsed.sleep_score >= 40 ? 'Fair' : 'Poor';
    }
    if (!Array.isArray(parsed.key_wins)) parsed.key_wins = [];
    if (!Array.isArray(parsed.pattern_insights)) parsed.pattern_insights = [];
    if (!parsed.focus_recommendation) parsed.focus_recommendation = 'Keep logging your sleep daily to get better insights.';
    if (!parsed.coach_note) parsed.coach_note = 'Keep up the great work! Every night of tracking brings you closer to better sleep.';

    return parsed;
  } catch {
    return generateFallbackReport(stats, prevStats);
  }
};

const generateFallbackReport = (stats: WeeklyStats, prevStats: PrevWeekStats | null): StructuredWeeklyReport => {
  const score = Math.round(
    ((stats.avg_quality || 3) / 5) * 40 +
    (Math.min((stats.avg_sleep_hours || 7) / 8, 1)) * 30 +
    (stats.total_checkins >= 5 ? 30 : (stats.total_checkins / 5) * 30)
  );

  return {
    sleep_score: score,
    sleep_score_label: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
    key_wins: [
      `Logged ${stats.total_checkins} check-in${stats.total_checkins > 1 ? 's' : ''} this week`,
      stats.avg_quality >= 3.5 ? 'Maintained good sleep quality' : 'Stayed consistent with tracking',
    ],
    pattern_insights: [
      `Average sleep: ${stats.avg_sleep_hours ?? 'N/A'} hours per night`,
      stats.phone_nights > 0 ? `Used phone before bed ${stats.phone_nights} nights` : 'Avoided phone before bed most nights',
    ],
    focus_recommendation: 'Try to keep a consistent bedtime this week and see how it affects your energy.',
    coach_note: prevStats?.avg_quality
      ? `Your quality ${stats.avg_quality >= prevStats.avg_quality ? 'improved' : 'dipped'} compared to last week. Keep tracking consistently — you're building great habits!`
      : 'Great job tracking your sleep! Keep it up and you\'ll start seeing patterns that can help you sleep better.',
  };
};
