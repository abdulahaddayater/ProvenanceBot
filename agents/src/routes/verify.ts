import type { FastifyInstance } from 'fastify';
import { hashContent } from '../lib/hash.js';
import { loadArchivedSource } from '../lib/archive.js';
import { getSorobanClient } from '../lib/soroban.js';

export async function verifyRoutes(app: FastifyInstance) {
  app.get<{ Params: { sourceHash: string } }>('/verify/:sourceHash', async (request, reply) => {
    const { sourceHash } = request.params;
    const archived = await loadArchivedSource(sourceHash);

    if (!archived) {
      return reply.status(404).send({ error: 'Source not found in archive' });
    }

    let liveMatch: boolean | null = null;
    try {
      const res = await fetch(archived.url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const text = await res.text();
        liveMatch = hashContent(text) === sourceHash;
      } else {
        liveMatch = false;
      }
    } catch {
      liveMatch = null;
    }

    return reply.send({
      sourceHash,
      archived: {
        url: archived.url,
        title: archived.title,
        content: archived.content,
        fetchedAt: archived.fetchedAt,
        archivedAt: archived.archivedAt,
      },
      liveUrlStatus: liveMatch === null ? 'unreachable' : liveMatch ? 'matches' : 'changed',
      liveContentMatchesHash: liveMatch,
    });
  });

  app.get<{ Querystring: { entryId?: string; sourceHash?: string } }>(
    '/verify-onchain',
    async (request, reply) => {
      const entryId = Number(request.query.entryId);
      const sourceHash = request.query.sourceHash;
      if (!entryId || !sourceHash) {
        return reply.status(400).send({ error: 'entryId and sourceHash required' });
      }
      const client = getSorobanClient();
      const verified = await client.verifySource(entryId, sourceHash);
      return reply.send({ entryId, sourceHash, verified, contractId: client.getContractId() });
    },
  );
}
