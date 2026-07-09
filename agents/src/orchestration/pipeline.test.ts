import { describe, expect, it } from 'vitest';
import { hashContent } from '../lib/hash.js';
import { orchestrateQuery } from '../orchestration/pipeline.js';

describe('pipeline integration', () => {
  it('runs full pipeline with mocked sources (skip anchor without keys)', async () => {
    const result = await orchestrateQuery('climate policy impacts', { skipAnchor: true });
    expect(result.status).not.toBe('error');
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.summary).toBeTruthy();
    expect(result.provenance.summaryHash).toHaveLength(64);
    expect(result.claimMappings.length).toBeGreaterThan(0);
  });

  it('hashes are consistent for archived content', () => {
    const h1 = hashContent('Test content');
    const h2 = hashContent('Test content');
    expect(h1).toBe(h2);
  });
});
