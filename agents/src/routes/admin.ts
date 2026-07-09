import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { exportPilotData, listFeedback, listWalletInteractions } from '../lib/store.js';
import { getSorobanClient } from '../lib/soroban.js';
import { loadContractId } from '../lib/contract-id.js';

function checkAdmin(request: { headers: Record<string, unknown> }): boolean {
  if (!env.ADMIN_API_KEY) return env.NODE_ENV === 'development';
  return request.headers['x-admin-key'] === env.ADMIN_API_KEY;
}

export async function adminRoutes(app: FastifyInstance) {
  app.get('/admin/interactions', async (request, reply) => {
    if (!checkAdmin(request)) return reply.status(401).send({ error: 'Unauthorized' });
    const interactions = await listWalletInteractions();
    return reply.send({ interactions });
  });

  app.get('/admin/feedback', async (request, reply) => {
    if (!checkAdmin(request)) return reply.status(401).send({ error: 'Unauthorized' });
    const feedback = await listFeedback();
    return reply.send({ feedback });
  });

  app.get('/admin/export', async (request, reply) => {
    if (!checkAdmin(request)) return reply.status(401).send({ error: 'Unauthorized' });
    const data = await exportPilotData();
    return reply.send(data);
  });

  app.get('/status', async (_request, reply) => {
    return reply.send({
      service: 'provenancebot-agents',
      status: 'ok',
      network: 'testnet',
      contractId: loadContractId() || getSorobanClient().getContractId(),
      sorobanConfigured: getSorobanClient().isConfigured(),
      timestamp: new Date().toISOString(),
    });
  });
}
