import 'dotenv/config';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env.js';
import { healthRoutes } from './routes/health.js';
import { queryRoutes } from './routes/query.js';
import { verifyRoutes } from './routes/verify.js';
import { feedbackRoutes } from './routes/feedback.js';
import { adminRoutes } from './routes/admin.js';

async function initSentry() {
  if (!env.SENTRY_DSN) return;
  try {
    const Sentry = await import('@sentry/node');
    Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
  } catch {
    // Sentry optional
  }
}

async function main() {
  await initSentry();

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  await app.register(healthRoutes);
  await app.register(adminRoutes);
  await app.register(queryRoutes, { prefix: '/api' });
  await app.register(verifyRoutes, { prefix: '/api' });
  await app.register(feedbackRoutes, { prefix: '/api' });

  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
