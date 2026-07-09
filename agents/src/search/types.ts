export interface SearchResult {
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
}

export interface SearchProvider {
  search(query: string, maxResults: number): Promise<SearchResult[]>;
}
