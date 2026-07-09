import { retriever } from '../agents/retriever.js';
import { synthesizer } from '../agents/synthesizer.js';
import { notary } from '../agents/notary.js';

export interface OrchestrationResult {
  query: string;
  status: 'scaffolded';
  message: string;
  sources: unknown[];
  summary: string | null;
  provenanceBatch: unknown | null;
}

/**
 * End-to-end pipeline stub:
 * query → Retriever → Notary (per-source) → Synthesizer → Notary (batch) → Soroban
 */
export async function orchestrateQuery(query: string): Promise<OrchestrationResult> {
  const sources = await retriever.fetchSources(query);
  const hashedSources = await notary.hashSources(sources);
  const summary = await synthesizer.summarize(query, hashedSources);
  const provenanceBatch = await notary.createBatch(hashedSources, summary);

  return {
    query,
    status: 'scaffolded',
    message:
      'Pipeline scaffolding only — Retriever, Synthesizer, and Notary return placeholders until business logic is implemented.',
    sources: hashedSources,
    summary,
    provenanceBatch,
  };
}
