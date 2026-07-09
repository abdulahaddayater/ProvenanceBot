export interface SearchResult {
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
  publisher?: string;
  publishedAt?: string;
  trustNote?: string;
  topics?: Array<'findings' | 'health' | 'solutions' | 'policy'>;
}

export interface SearchProvider {
  search(query: string, maxResults: number): Promise<SearchResult[]>;
}
