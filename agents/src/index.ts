import 'dotenv/config';
import Fastify from 'fastify';
import { env } from './config/env.js';
import { healthRoutes } from './routes/health.js';
import { queryRoutes } from './routes/query.js';

async function main() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(healthRoutes);
  await app.register(queryRoutes, { prefix: '/api' });

  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
