import { describe, expect, it } from 'vitest';
import { synthesize, matchesMicroplastics } from '../agents/synthesizer.js';
import type { RetrievedSource } from '../agents/retriever.js';
import { getMicroplasticsSources } from '../search/stub-knowledge.js';

describe('synthesizer claim mappings', () => {
  const sources: RetrievedSource[] = [
    {
      url: 'https://a.example/1',
      title: 'Source A',
      content: 'Alpha content about the topic with enough length to qualify as substantive.',
      fetchedAt: '2026-01-01T00:00:00.000Z',
      publisher: 'Example Publisher',
      publishedAt: '2025-01-01',
      topics: ['findings'],
    },
    {
      url: 'https://b.example/2',
      title: 'Source B',
      content: 'Beta content with additional detail that supports a second claim in the summary.',
      fetchedAt: '2026-01-01T00:00:00.000Z',
      publisher: 'Another Publisher',
      publishedAt: '2025-02-01',
      topics: ['solutions'],
    },
  ];

  it('maps each sentence to supporting source indices', async () => {
    const result = await synthesize('generic environmental topic', sources);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.claimMappings.length).toBeGreaterThan(0);
    expect(result.summary.toLowerCase()).not.toContain('here is a concise answer');
    for (const mapping of result.claimMappings) {
      expect(mapping.sourceIndices.every((i) => i >= 1 && i <= sources.length)).toBe(true);
    }
  });

  it('synthesizes microplastics findings and solutions without echoing the query', async () => {
    const microSources = getMicroplasticsSources('2026-01-01T00:00:00.000Z');
    const query =
      'What are the latest scientific findings on microplastic contamination in drinking water, and what solutions are currently supported by peer-reviewed research?';

    expect(matchesMicroplastics(query)).toBe(true);

    const result = await synthesize(query, microSources);
    const lower = result.summary.toLowerCase();

    expect(lower).toContain('tap water');
    expect(lower).toContain('nanoplastic');
    expect(lower).toContain('reverse osmosis');
    expect(lower).toContain('activated carbon');
    expect(lower).toContain('source reduction');
    expect(lower).not.toContain('here is a concise answer');
    expect(result.claimMappings.length).toBeGreaterThanOrEqual(5);
  });
});
