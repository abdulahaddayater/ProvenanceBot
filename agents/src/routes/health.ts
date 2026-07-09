import type { FastifyInstance } from 'fastify';
import { loadContractId } from '../lib/contract-id.js';
import { getSorobanClient } from '../lib/soroban.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'provenancebot-agents',
    contractId: loadContractId() || getSorobanClient().getContractId() || null,
    sorobanReady: getSorobanClient().isConfigured(),
  }));
}
