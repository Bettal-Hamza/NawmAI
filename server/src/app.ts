import Fastify from 'fastify';
import dotenv from 'dotenv';
import { registerCors } from './plugins/cors';
import { userRoutes } from './routes/users';
import { profileRoutes } from './routes/profiles';
import { checkinRoutes } from './routes/checkins';
import { reportRoutes } from './routes/reports';
import { feedbackRoutes } from './routes/feedback';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001');

const app = Fastify({ logger: true });

// Register plugins and routes
const start = async () => {
  try {
    await registerCors(app);
    await app.register(userRoutes);
    await app.register(profileRoutes);
    await app.register(checkinRoutes);
    await app.register(reportRoutes);
    await app.register(feedbackRoutes);

    // Health check endpoint
    app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 NawmAI server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
