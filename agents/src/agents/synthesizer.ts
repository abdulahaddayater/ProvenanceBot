import type { RetrievedSource } from './retriever.js';

export interface ClaimMapping {
  /** Sentence index in summary */
  sentenceIndex: number;
  /** 1-based source indices cited */
  sourceIndices: number[];
}

export interface SynthesisResult {
  summary: string;
  claimMappings: ClaimMapping[];
}

export async function synthesize(query: string, sources: RetrievedSource[]): Promise<SynthesisResult> {
  if (sources.length === 0) {
    return { summary: 'No sources were available to synthesize an answer.', claimMappings: [] };
  }

  const sentences: string[] = [];
  const claimMappings: ClaimMapping[] = [];

  sentences.push(
    `Based on ${sources.length} retrieved sources, here is a concise answer to: "${query}".`,
  );
  claimMappings.push({ sentenceIndex: 0, sourceIndices: sources.map((_, i) => i + 1) });

  sources.forEach((source, idx) => {
    const excerpt = source.content.slice(0, 180).trim();
    const sentence = `${source.title}: ${excerpt}${source.content.length > 180 ? '…' : ''}`;
    sentences.push(sentence);
    claimMappings.push({ sentenceIndex: sentences.length - 1, sourceIndices: [idx + 1] });
  });

  sentences.push(
    'Each claim above is linked to specific source indices for on-chain verification via ProvenanceBot.',
  );
  claimMappings.push({
    sentenceIndex: sentences.length - 1,
    sourceIndices: sources.map((_, i) => i + 1),
  });

  return {
    summary: sentences.join(' '),
    claimMappings,
  };
}
