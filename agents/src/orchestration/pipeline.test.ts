import { describe, expect, it } from 'vitest';
import { orchestrateQuery } from './pipeline.js';

describe('orchestrateQuery (scaffold)', () => {
  it('returns a scaffolded pipeline response', async () => {
    const result = await orchestrateQuery('What is ProvenanceBot?');
    expect(result.status).toBe('scaffolded');
    expect(result.query).toBe('What is ProvenanceBot?');
    expect(result.sources).toEqual([]);
    expect(result.summary).toBeNull();
    expect(result.provenanceBatch).toBeNull();
  });
});
