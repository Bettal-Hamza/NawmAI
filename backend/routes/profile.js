/**
 * User profile route
 * Stores only what affects AI output
 */
async function profileRoutes(fastify, options) {
    // POST /api/profile - Create user profile
    fastify.post('/api/profile', {
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'email', 'bedtime', 'wake_time', 'main_problem', 'phone_usage'],
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    bedtime: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
                    wake_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
                    main_problem: { type: 'string' },
                    phone_usage: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        const { user_id, email, bedtime, wake_time, main_problem, phone_usage } = request.body;

        const client = await fastify.pg.connect();

        try {
            await client.query('BEGIN');

            // Insert into users table
            await client.query(
                `INSERT INTO users (id, email, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET email = $2`,
                [user_id, email]
            );

            // Insert into sleep_profiles table
            await client.query(
                `INSERT INTO sleep_profiles (user_id, bedtime, wake_time, main_problem, phone_usage)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE 
         SET bedtime = $2, wake_time = $3, main_problem = $4, phone_usage = $5`,
                [user_id, bedtime, wake_time, main_problem, phone_usage]
            );

            await client.query('COMMIT');

            return {
                success: true,
                user_id,
                message: 'Profile created successfully'
            };
        } catch (error) {
            await client.query('ROLLBACK');
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to create profile'
            };
        } finally {
            client.release();
        }
    });

    // GET /api/profile/:user_id - Get user profile
    fastify.get('/api/profile/:user_id', async (request, reply) => {
        const { user_id } = request.params;

        try {
            const result = await fastify.pg.query(
                `SELECT u.id, u.email, u.created_at,
                sp.bedtime, sp.wake_time, sp.main_problem, sp.phone_usage
         FROM users u
         LEFT JOIN sleep_profiles sp ON u.id = sp.user_id
         WHERE u.id = $1`,
                [user_id]
            );

            if (result.rows.length === 0) {
                reply.code(404);
                return {
                    success: false,
                    error: 'Profile not found'
                };
            }

            return {
                success: true,
                profile: result.rows[0]
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: 'Failed to fetch profile'
            };
        }
    });
}

module.exports = profileRoutes;
