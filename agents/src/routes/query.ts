import type { FastifyInstance } from 'fastify';
import { orchestrateQuery } from '../orchestration/pipeline.js';

export async function queryRoutes(app: FastifyInstance) {
  app.post<{ Body: { query?: string } }>('/query', async (request, reply) => {
    const query = request.body?.query?.trim();
    if (!query) {
      return reply.status(400).send({ error: 'query is required' });
    }

    // Scaffolding: orchestration returns a stub response until agents are implemented.
    const result = await orchestrateQuery(query);
    return result;
  });
}
