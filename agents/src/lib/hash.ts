import { createHash } from 'node:crypto';

/** Normalize text for stable SHA-256 hashing (whitespace, line endings). */
export function normalizeContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +\n/g, '\n')
    .replace(/\n +/g, '\n')
    .trim()
    .toLowerCase();
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

export function hashContent(content: string): string {
  return sha256Hex(normalizeContent(content));
}

export function hashUri(uri: string): string {
  return sha256Hex(uri.trim().toLowerCase());
}

export function hashQuery(query: string): string {
  return sha256Hex(normalizeContent(query));
}

export function hashSummary(summary: string): string {
  return sha256Hex(normalizeContent(summary));
}

/** Convert 64-char hex hash to 32-byte Buffer for Soroban BytesN<32>. */
export function hexToBytes32(hex: string): Buffer {
  const normalized = hex.replace(/^0x/, '');
  if (normalized.length !== 64) {
    throw new Error(`Expected 32-byte hex hash, got length ${normalized.length}`);
  }
  return Buffer.from(normalized, 'hex');
}
