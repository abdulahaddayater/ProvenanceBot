import { env } from '../config/env.js';
import { StubSearchProvider } from './stub-provider.js';
import type { SearchProvider } from './types.js';

export function createSearchProvider(): SearchProvider {
  switch (env.SEARCH_PROVIDER) {
    case 'stub':
    default:
      return new StubSearchProvider();
  }
}

export type { SearchProvider, SearchResult } from './types.js';
