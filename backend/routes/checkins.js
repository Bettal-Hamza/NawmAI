/**
 * Daily sleep check-in route
 * Simplified payload for minimal friction
 */
async function checkinRoutes(fastify, options) {
    // POST /api/checkins - Create daily sleep check-in
    fastify.post('/api/checkins', {
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'sleep_hours', 'sleep_quality', 'phone_before_bed'],
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    sleep_hours: { type: 'number', minimum: 0, maximum: 24 },
                    sleep_quality: { type: 'integer', minimum: 1, maximum: 5 },
                    phone_before_bed: { type: 'boolean' }
                }
            }
        }
    }, async (request, reply) => {
        const { user_id, sleep_hours, sleep_quality, phone_before_bed } = request.body;

        try {
            const result = await fastify.pg.query(
                `INSERT INTO sleep_checkins (user_id, sleep_hours, sleep_quality, phone_before_bed, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)
         RETURNING id`,
                [user_id, sleep_hours, sleep_quality, phone_before_bed]
            );

            return {
                success: true,
                checkin_id: result.rows[0].id,
                message: 'Sleep check-in saved successfully'
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to save check-in'
            };
        }
    });

    // GET /api/checkins/:user_id - Get user's check-ins
    fastify.get('/api/checkins/:user_id', async (request, reply) => {
        const { user_id } = request.params;
        const { limit = 7 } = request.query;

        try {
            const result = await fastify.pg.query(
                `SELECT id, sleep_hours, sleep_quality, phone_before_bed, created_at
         FROM sleep_checkins
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
                [user_id, limit]
            );

            return {
                success: true,
                checkins: result.rows
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to fetch check-ins'
            };
        }
    });
}

module.exports = checkinRoutes;
