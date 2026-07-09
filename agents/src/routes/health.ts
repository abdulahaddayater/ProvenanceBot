import type { FastifyInstance } from 'fastify';
import { loadContractId } from '../lib/contract-id.js';
import { getSorobanClient } from '../lib/soroban.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => ({
    service: 'provenancebot-agents',
    status: 'ok',
    message: 'API is running. Use the frontend app for the query UI.',
    endpoints: {
      health: 'GET /health',
      query: 'POST /api/query',
      verify: 'GET /api/verify/:sourceHash',
      feedback: 'POST /api/feedback',
      status: 'GET /status',
      admin: 'GET /admin/interactions, /admin/feedback, /admin/export',
    },
  }));

  app.get('/health', async () => ({
    status: 'ok',
    service: 'provenancebot-agents',
    contractId: loadContractId() || getSorobanClient().getContractId() || null,
    sorobanReady: getSorobanClient().isConfigured(),
  }));
}
