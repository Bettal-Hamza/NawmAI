const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const postgres = require('@fastify/postgres');
require('dotenv').config();

// Register CORS
fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
});

// Register PostgreSQL
fastify.register(postgres, {
    connectionString: process.env.DATABASE_URL
});

// Register routes
fastify.register(require('./routes/profile'));
fastify.register(require('./routes/checkins'));
fastify.register(require('./routes/feedback'));
fastify.register(require('./routes/admin'));

// Health check
fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Single error handler (no over-engineering)
fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(error.statusCode || 500).send({
        success: false,
        error: error.message || 'Internal Server Error'
    });
});

// Start server
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
