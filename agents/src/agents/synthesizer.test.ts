import { describe, expect, it } from 'vitest';
import { synthesize } from '../agents/synthesizer.js';
import type { RetrievedSource } from '../agents/retriever.js';

describe('synthesizer claim mappings', () => {
  const sources: RetrievedSource[] = [
    {
      url: 'https://a.example/1',
      title: 'Source A',
      content: 'Alpha content about the topic.',
      fetchedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      url: 'https://b.example/2',
      title: 'Source B',
      content: 'Beta content with additional detail.',
      fetchedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('maps each sentence to supporting source indices', async () => {
    const result = await synthesize('test query', sources);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.claimMappings.length).toBeGreaterThan(0);
    for (const mapping of result.claimMappings) {
      expect(mapping.sourceIndices.every((i) => i >= 1 && i <= sources.length)).toBe(true);
    }
  });
});
