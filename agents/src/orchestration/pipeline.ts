import { fetchSources } from '../agents/retriever.js';
import { synthesize } from '../agents/synthesizer.js';
import { hashAndArchiveSources, submitProvenanceBatch } from '../agents/notary.js';
import { logWalletInteraction } from '../lib/store.js';
import { getSorobanClient } from '../lib/soroban.js';
import type { HashedSource } from '../agents/notary.js';
import type { ClaimMapping } from '../agents/synthesizer.js';

export type PipelineStage =
  | 'fetching'
  | 'hashing'
  | 'summarizing'
  | 'anchoring'
  | 'complete'
  | 'error';

export interface SourceResponse {
  index: number;
  url: string;
  title: string;
  sourceHash: string;
  uriHash: string;
  fetchedAt: string;
  publisher?: string;
  publishedAt?: string;
  trustNote?: string;
}

export interface OrchestrationResult {
  query: string;
  status: 'success' | 'partial' | 'error';
  stage: PipelineStage;
  message?: string;
  sources: SourceResponse[];
  failedSources: Array<{ index: number; reason: string }>;
  summary: string;
  claimMappings: ClaimMapping[];
  provenance: {
    queryHash: string;
    summaryHash: string;
    entryId: number | null;
    txHash: string | null;
    contractId: string;
  };
  walletAddress?: string;
}

export interface OrchestrateOptions {
  walletAddress?: string;
  skipAnchor?: boolean;
}

export async function orchestrateQuery(
  query: string,
  options: OrchestrateOptions = {},
): Promise<OrchestrationResult> {
  const retrieved = await fetchSources(query);

  if (retrieved.sources.length === 0) {
    return {
      query,
      status: 'error',
      stage: 'error',
      message: 'No sources could be retrieved for this query.',
      sources: [],
      failedSources: retrieved.failures,
      summary: '',
      claimMappings: [],
      provenance: {
        queryHash: '',
        summaryHash: '',
        entryId: null,
        txHash: null,
        contractId: getSorobanClient().getContractId(),
      },
    };
  }

  const hashed = await hashAndArchiveSources(retrieved.sources);
  const synthesis = await synthesize(query, retrieved.sources);

  let batch;
  if (options.skipAnchor) {
    const { hashQuery, hashSummary } = await import('../lib/hash.js');
    batch = {
      queryHash: hashQuery(query),
      summaryHash: hashSummary(synthesis.summary),
      sources: hashed,
      sourceRecords: hashed.map((s) => ({
        sourceHash: s.sourceHash,
        uriHash: s.uriHash,
        retrievedAt: Math.floor(new Date(s.fetchedAt).getTime() / 1000),
      })),
      entryId: null,
      txHash: null,
      contractId: getSorobanClient().getContractId(),
    };
  } else {
    batch = await submitProvenanceBatch(query, hashed, synthesis);
  }

  const sources: SourceResponse[] = hashed.map((s: HashedSource, i: number) => ({
    index: i + 1,
    url: s.url,
    title: s.title,
    sourceHash: s.sourceHash,
    uriHash: s.uriHash,
    fetchedAt: s.fetchedAt,
    publisher: s.publisher,
    publishedAt: s.publishedAt,
    trustNote: s.trustNote,
  }));

  if (options.walletAddress && batch.entryId !== null) {
    await logWalletInteraction({
      walletAddress: options.walletAddress,
      query,
      entryId: batch.entryId,
      txHash: batch.txHash,
      summaryHash: batch.summaryHash,
    });
  }

  return {
    query,
    status: retrieved.partial ? 'partial' : 'success',
    stage: 'complete',
    sources,
    failedSources: retrieved.failures,
    summary: synthesis.summary,
    claimMappings: synthesis.claimMappings,
    provenance: {
      queryHash: batch.queryHash,
      summaryHash: batch.summaryHash,
      entryId: batch.entryId,
      txHash: batch.txHash,
      contractId: batch.contractId,
    },
    walletAddress: options.walletAddress,
  };
}
