/**
 * Admin routes for data export
 * Critical for Enactus: Shows real user data and impact
 */
async function adminRoutes(fastify, options) {
    // GET /api/admin/export/feedback - Export feedback as CSV
    fastify.get('/api/admin/export/feedback', async (request, reply) => {
        try {
            const result = await fastify.pg.query(
                `SELECT f.id, f.user_id, u.email, f.helpful, f.comment, f.created_at
         FROM feedback f
         JOIN users u ON f.user_id = u.id
         ORDER BY f.created_at DESC`
            );

            // Convert to CSV
            const csv = convertToCSV(result.rows, [
                'id', 'user_id', 'email', 'helpful', 'comment', 'created_at'
            ]);

            reply
                .header('Content-Type', 'text/csv')
                .header('Content-Disposition', 'attachment; filename=feedback_export.csv')
                .send(csv);
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to export feedback'
            };
        }
    });

    // GET /api/admin/export/stats - Export sleep improvement stats as CSV
    fastify.get('/api/admin/export/stats', async (request, reply) => {
        try {
            const result = await fastify.pg.query(
                `SELECT 
          u.id as user_id,
          u.email,
          sp.main_problem,
          COUNT(sc.id) as total_checkins,
          ROUND(AVG(sc.sleep_hours), 2) as avg_sleep_hours,
          ROUND(AVG(sc.sleep_quality), 2) as avg_sleep_quality,
          SUM(CASE WHEN sc.phone_before_bed = true THEN 1 ELSE 0 END) as phone_nights,
          MIN(sc.created_at) as first_checkin,
          MAX(sc.created_at) as last_checkin
         FROM users u
         JOIN sleep_profiles sp ON u.id = sp.user_id
         LEFT JOIN sleep_checkins sc ON u.id = sc.user_id
         GROUP BY u.id, u.email, sp.main_problem
         ORDER BY total_checkins DESC`
            );

            // Convert to CSV
            const csv = convertToCSV(result.rows, [
                'user_id', 'email', 'main_problem', 'total_checkins',
                'avg_sleep_hours', 'avg_sleep_quality', 'phone_nights',
                'first_checkin', 'last_checkin'
            ]);

            reply
                .header('Content-Type', 'text/csv')
                .header('Content-Disposition', 'attachment; filename=sleep_stats_export.csv')
                .send(csv);
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to export stats'
            };
        }
    });

    // GET /api/admin/dashboard - Get dashboard overview
    fastify.get('/api/admin/dashboard', async (request, reply) => {
        try {
            const [userStats, feedbackStats, sleepStats] = await Promise.all([
                // User statistics
                fastify.pg.query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week
          FROM users
        `),
                // Feedback statistics
                fastify.pg.query(`
          SELECT 
            COUNT(*) as total_feedback,
            SUM(CASE WHEN helpful = true THEN 1 ELSE 0 END) as helpful_count
          FROM feedback
        `),
                // Sleep statistics
                fastify.pg.query(`
          SELECT 
            COUNT(*) as total_checkins,
            ROUND(AVG(sleep_hours), 2) as avg_sleep_hours,
            ROUND(AVG(sleep_quality), 2) as avg_sleep_quality
          FROM sleep_checkins
        `)
            ]);

            return {
                success: true,
                dashboard: {
                    users: userStats.rows[0],
                    feedback: feedbackStats.rows[0],
                    sleep: sleepStats.rows[0]
                }
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to fetch dashboard data'
            };
        }
    });
}

/**
 * Helper function to convert array of objects to CSV
 */
function convertToCSV(data, headers) {
    if (data.length === 0) {
        return headers.join(',');
    }

    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

module.exports = adminRoutes;
