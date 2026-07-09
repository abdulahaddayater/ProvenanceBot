import { archiveSource } from '../lib/archive.js';
import { hashContent, hashQuery, hashSummary, hashUri } from '../lib/hash.js';
import { getSorobanClient, type SourceRecordInput } from '../lib/soroban.js';
import type { RetrievedSource } from './retriever.js';
import type { SynthesisResult } from './synthesizer.js';

export interface HashedSource extends RetrievedSource {
  sourceHash: string;
  uriHash: string;
}

export interface ProvenanceBatch {
  queryHash: string;
  summaryHash: string;
  sources: HashedSource[];
  sourceRecords: SourceRecordInput[];
  entryId: number | null;
  txHash: string | null;
  contractId: string;
}

export async function hashAndArchiveSources(sources: RetrievedSource[]): Promise<HashedSource[]> {
  const hashed: HashedSource[] = [];

  for (const source of sources) {
    const sourceHash = hashContent(source.content);
    const uriHash = hashUri(source.url);
    const record: HashedSource = { ...source, sourceHash, uriHash };
    hashed.push(record);

    await archiveSource({
      sourceHash,
      uriHash,
      url: source.url,
      title: source.title,
      content: source.content,
      fetchedAt: source.fetchedAt,
      archivedAt: new Date().toISOString(),
    });
  }

  return hashed;
}

export async function submitProvenanceBatch(
  query: string,
  sources: HashedSource[],
  synthesis: SynthesisResult,
): Promise<ProvenanceBatch> {
  const queryHash = hashQuery(query);
  const summaryHash = hashSummary(synthesis.summary);

  const sourceRecords: SourceRecordInput[] = sources.map((s) => ({
    sourceHash: s.sourceHash,
    uriHash: s.uriHash,
    retrievedAt: Math.floor(new Date(s.fetchedAt).getTime() / 1000),
  }));

  const sorobanClient = getSorobanClient();
  const base: ProvenanceBatch = {
    queryHash,
    summaryHash,
    sources,
    sourceRecords,
    entryId: null,
    txHash: null,
    contractId: sorobanClient.getContractId(),
  };

  if (!sorobanClient.isConfigured()) {
    return base;
  }

  try {
    const result = await sorobanClient.submitProvenance(summaryHash, queryHash, sourceRecords);
    return {
      ...base,
      entryId: result.entryId,
      txHash: result.txHash,
      contractId: result.contractId,
    };
  } catch (err) {
    throw new Error(
      `Soroban submit failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
