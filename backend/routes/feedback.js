/**
 * Feedback route
 * Critical for Enactus demo/presentation
 */
async function feedbackRoutes(fastify, options) {
    // POST /api/feedback - Submit user feedback
    fastify.post('/api/feedback', {
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'helpful'],
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    helpful: { type: 'boolean' },
                    comment: { type: 'string', maxLength: 500 }
                }
            }
        }
    }, async (request, reply) => {
        const { user_id, helpful, comment = null } = request.body;

        try {
            const result = await fastify.pg.query(
                `INSERT INTO feedback (user_id, helpful, comment, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
                [user_id, helpful, comment]
            );

            return {
                success: true,
                feedback_id: result.rows[0].id,
                message: 'Thank you for your feedback!'
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to save feedback'
            };
        }
    });

    // GET /api/feedback/stats - Get feedback statistics
    fastify.get('/api/feedback/stats', async (request, reply) => {
        try {
            const result = await fastify.pg.query(
                `SELECT 
          COUNT(*) as total_feedback,
          SUM(CASE WHEN helpful = true THEN 1 ELSE 0 END) as helpful_count,
          SUM(CASE WHEN helpful = false THEN 1 ELSE 0 END) as not_helpful_count,
          ROUND(AVG(CASE WHEN helpful = true THEN 100 ELSE 0 END), 2) as helpful_percentage
         FROM feedback`
            );

            return {
                success: true,
                stats: result.rows[0]
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to fetch feedback stats'
            };
        }
    });
}

module.exports = feedbackRoutes;
