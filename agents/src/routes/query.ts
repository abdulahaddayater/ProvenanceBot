import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { orchestrateQuery } from '../orchestration/pipeline.js';

const bodySchema = z.object({
  query: z.string().min(1).max(2000),
  walletAddress: z.string().optional(),
  demoMode: z.boolean().optional(),
});

export async function queryRoutes(app: FastifyInstance) {
  app.post('/query', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const { query, walletAddress, demoMode } = parsed.data;

    if (!demoMode && !walletAddress) {
      return reply.status(400).send({
        error: 'Wallet required',
        message: 'Connect your Freighter wallet before submitting a query for on-chain anchoring.',
      });
    }

    try {
      const result = await orchestrateQuery(query, {
        walletAddress,
        skipAnchor: demoMode === true,
      });
      return reply.send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({
        error: 'Pipeline failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}
