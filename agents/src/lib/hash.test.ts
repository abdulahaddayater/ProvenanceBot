import { describe, expect, it } from 'vitest';
import { hashContent, hashQuery, hashSummary, hashUri, normalizeContent } from './hash.js';

describe('hash utilities', () => {
  it('normalizes whitespace consistently', () => {
    expect(normalizeContent('  Hello   World  \n\n\n Test ')).toBe('hello world\n\ntest');
  });

  it('produces stable 64-char hex hashes', () => {
    const h = hashContent('Same content');
    expect(h).toHaveLength(64);
    expect(hashContent('Same content')).toBe(h);
    expect(hashContent('Different')).not.toBe(h);
  });

  it('hashes URI and query independently', () => {
    expect(hashUri('https://Example.COM/path')).toBe(hashUri('https://example.com/path'));
    expect(hashQuery('What is provenance?')).not.toBe(hashSummary('A synthesized summary.'));
  });
});
