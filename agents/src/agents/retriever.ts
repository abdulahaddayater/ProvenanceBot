import { env } from '../config/env.js';
import { createSearchProvider } from '../search/index.js';
import type { SearchResult } from '../search/types.js';

export interface RetrievedSource {
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
}

export interface RetrieverResult {
  sources: RetrievedSource[];
  failures: Array<{ index: number; reason: string }>;
  partial: boolean;
}

export async function fetchSources(query: string): Promise<RetrieverResult> {
  const provider = createSearchProvider();
  const max = Math.min(env.RETRIEVER_MAX_SOURCES, 5);
  const failures: RetrieverResult['failures'] = [];
  const sources: RetrievedSource[] = [];

  let candidates: SearchResult[] = [];
  try {
    candidates = await provider.search(query, max);
  } catch (err) {
    failures.push({ index: -1, reason: err instanceof Error ? err.message : 'Search failed' });
    return { sources: [], failures, partial: true };
  }

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    try {
      if (!c.content?.trim()) {
        failures.push({ index: i, reason: 'Empty content' });
        continue;
      }
      sources.push({
        url: c.url,
        title: c.title,
        content: c.content,
        fetchedAt: c.fetchedAt,
      });
    } catch (err) {
      failures.push({
        index: i,
        reason: err instanceof Error ? err.message : 'Fetch failed',
      });
    }
  }

  return {
    sources,
    failures,
    partial: failures.length > 0,
  };
}
