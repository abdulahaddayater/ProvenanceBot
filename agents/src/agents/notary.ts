/**
 * Notary agent — hashes sources, batches provenance payloads, writes to Soroban.
 * Business logic intentionally omitted (scaffolding only).
 */
import type { SourceCandidate } from './retriever.js';

export interface HashedSource extends SourceCandidate {
  contentHash: string;
}

export interface ProvenanceBatch {
  sourceHashes: string[];
  summaryHash: string;
  timestamp: string;
  contractTxId: string | null;
}

export const notary = {
  async hashSources(sources: SourceCandidate[]): Promise<HashedSource[]> {
    return sources.map((source) => ({
      ...source,
      contentHash: '',
    }));
  },

  async createBatch(
    _sources: HashedSource[],
    _summary: string | null,
  ): Promise<ProvenanceBatch | null> {
    return null;
  },
};
