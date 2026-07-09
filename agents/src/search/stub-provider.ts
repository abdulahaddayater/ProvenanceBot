import type { SearchProvider, SearchResult } from './types.js';

/**
 * Pluggable stub search provider — returns deterministic mock sources per query.
 * Swap for Tavily, SerpAPI, Brave Search, etc. via SEARCH_PROVIDER env.
 */
export class StubSearchProvider implements SearchProvider {
  async search(query: string, maxResults: number): Promise<SearchResult[]> {
    const now = new Date().toISOString();
    const topics = [
      {
        title: `Overview: ${query}`,
        content: `This source provides background context on "${query}". It explains key concepts, historical development, and why the topic matters to researchers and journalists seeking verifiable information.`,
        url: `https://example.org/research/${encodeURIComponent(query.slice(0, 40))}/overview`,
      },
      {
        title: `Analysis — ${query}`,
        content: `An analytical perspective on "${query}" covering recent findings, expert opinions, and data points. Useful for cross-checking claims before publication.`,
        url: `https://example.org/research/${encodeURIComponent(query.slice(0, 40))}/analysis`,
      },
      {
        title: `Primary data — ${query}`,
        content: `Primary-source style notes related to "${query}" including dates, named entities, and measurable outcomes cited in downstream reporting.`,
        url: `https://example.org/research/${encodeURIComponent(query.slice(0, 40))}/data`,
      },
      {
        title: `Fact check context — ${query}`,
        content: `Verification-oriented summary for "${query}" highlighting common misconceptions and linking to corroborating evidence paths.`,
        url: `https://example.org/research/${encodeURIComponent(query.slice(0, 40))}/factcheck`,
      },
      {
        title: `Related reporting — ${query}`,
        content: `Journalistic coverage angles on "${query}" with emphasis on source attribution and timeline of events.`,
        url: `https://example.org/research/${encodeURIComponent(query.slice(0, 40))}/reporting`,
      },
    ];

    return topics.slice(0, maxResults).map((t) => ({
      ...t,
      fetchedAt: now,
    }));
  }
}
