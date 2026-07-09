import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

export interface ArchivedSource {
  sourceHash: string;
  uriHash: string;
  url: string;
  title: string;
  content: string;
  fetchedAt: string;
  archivedAt: string;
}

function archivePath(sourceHash: string): string {
  return path.join(env.CONTENT_ARCHIVE_DIR, `${sourceHash}.json`);
}

export async function ensureArchiveDir(): Promise<void> {
  await mkdir(env.CONTENT_ARCHIVE_DIR, { recursive: true });
}

export async function archiveSource(record: ArchivedSource): Promise<void> {
  await ensureArchiveDir();
  await writeFile(archivePath(record.sourceHash), JSON.stringify(record, null, 2), 'utf8');
}

export async function loadArchivedSource(sourceHash: string): Promise<ArchivedSource | null> {
  try {
    const raw = await readFile(archivePath(sourceHash), 'utf8');
    return JSON.parse(raw) as ArchivedSource;
  } catch {
    return null;
  }
}
