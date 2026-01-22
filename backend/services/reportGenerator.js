const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a weekly sleep report from 7 days of sleep data
 * @param {Array} sleepData - Array of 7 sleep check-in objects
 * @returns {Promise<string>} - Friendly, motivational sleep report
 */
async function generateWeeklyReport(sleepData) {
    // Feature flag check
    if (process.env.USE_AI !== 'true') {
        return getFallbackMessage(sleepData);
    }

    try {
        // Pre-compute stats (cheaper, faster, more reliable)
        const stats = computeStats(sleepData);

        // Create AI prompt with pre-computed stats
        const prompt = `You are an AI sleep coach for students.
Explain the weekly sleep data in a friendly, motivational way.
DO NOT give medical advice.
DO NOT diagnose conditions.
Focus on habits and small improvements.
Limit response to 120 words.

Weekly Sleep Stats:
- Average sleep: ${stats.avg_sleep} hours
- Best night: ${stats.best_day_sleep} hours
- Worst night: ${stats.worst_day_sleep} hours
- Nights with phone before bed: ${stats.phone_nights} out of 7
- Sleep quality trend: ${stats.quality_trend}

Generate a friendly, motivational message for the student.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a supportive sleep coach for students. Be friendly, motivational, and focus on small improvements. Never give medical advice.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error);
        return getFallbackMessage(sleepData);
    }
}

/**
 * Pre-computes statistics from sleep data
 * This is sent to OpenAI instead of raw data (cheaper, faster, more reliable)
 */
function computeStats(sleepData) {
    if (!sleepData || sleepData.length === 0) {
        return {
            avg_sleep: 0,
            best_day_sleep: 0,
            worst_day_sleep: 0,
            phone_nights: 0,
            quality_trend: 'unknown'
        };
    }

    const sleepHours = sleepData.map(d => d.sleep_hours);
    const qualities = sleepData.map(d => d.sleep_quality);
    const phoneNights = sleepData.filter(d => d.phone_before_bed).length;

    // Calculate averages
    const avg_sleep = (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1);
    const best_day_sleep = Math.max(...sleepHours);
    const worst_day_sleep = Math.min(...sleepHours);

    // Determine quality trend
    const firstHalf = qualities.slice(0, Math.floor(qualities.length / 2));
    const secondHalf = qualities.slice(Math.floor(qualities.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let quality_trend = 'stable';
    if (secondAvg > firstAvg + 0.5) {
        quality_trend = 'improving';
    } else if (secondAvg < firstAvg - 0.5) {
        quality_trend = 'declining';
    }

    return {
        avg_sleep: parseFloat(avg_sleep),
        best_day_sleep,
        worst_day_sleep,
        phone_nights,
        quality_trend
    };
}

/**
 * Fallback message when AI is unavailable or disabled
 */
function getFallbackMessage(sleepData) {
    const stats = computeStats(sleepData);

    let message = `📊 Your Weekly Sleep Summary\n\n`;
    message += `You averaged ${stats.avg_sleep} hours of sleep this week. `;

    if (stats.avg_sleep < 7) {
        message += `Try to aim for 7-9 hours for optimal rest! `;
    } else {
        message += `Great job maintaining healthy sleep hours! `;
    }

    if (stats.phone_nights > 4) {
        message += `\n\n📱 You used your phone before bed on ${stats.phone_nights} nights. Consider reducing screen time 30 minutes before sleep to improve sleep quality.`;
    }

    if (stats.quality_trend === 'improving') {
        message += `\n\n✨ Your sleep quality is improving! Keep up the good habits.`;
    } else if (stats.quality_trend === 'declining') {
        message += `\n\n💡 Your sleep quality has dipped slightly. Try sticking to a consistent bedtime routine.`;
    }

    message += `\n\nKeep tracking your sleep to see your progress! 🌙`;

    return message;
}

module.exports = {
    generateWeeklyReport,
    computeStats
};
