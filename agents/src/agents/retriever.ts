/**
 * Retriever agent — fetches candidate sources for a user query.
 * Business logic intentionally omitted (scaffolding only).
 */
export interface SourceCandidate {
  url: string;
  title: string;
  excerpt: string;
  retrievedAt: string;
}

export const retriever = {
  async fetchSources(_query: string): Promise<SourceCandidate[]> {
    return [];
  },
};
