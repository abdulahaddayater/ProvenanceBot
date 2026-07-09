/**
 * Synthesizer agent — writes a grounded summary from hashed sources.
 * Business logic intentionally omitted (scaffolding only).
 */
import type { HashedSource } from './notary.js';

export const synthesizer = {
  async summarize(_query: string, _sources: HashedSource[]): Promise<string | null> {
    return null;
  },
};
