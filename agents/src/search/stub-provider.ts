import { resolveCuratedSources } from './stub-knowledge.js';
import type { SearchProvider, SearchResult } from './types.js';

/**
 * Pluggable stub search provider — returns curated research sources per topic.
 * Swap for Tavily, SerpAPI, Brave Search, etc. via SEARCH_PROVIDER env.
 */
export class StubSearchProvider implements SearchProvider {
  async search(query: string, maxResults: number): Promise<SearchResult[]> {
    const fetchedAt = new Date().toISOString();
    return resolveCuratedSources(query, maxResults, fetchedAt);
  }
}
