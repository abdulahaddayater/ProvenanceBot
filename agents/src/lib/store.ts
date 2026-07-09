import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

export interface WalletInteraction {
  id: string;
  walletAddress: string;
  query: string;
  entryId: number | null;
  txHash: string | null;
  summaryHash: string;
  timestamp: string;
}

export interface FeedbackSubmission {
  id: string;
  rating: number;
  comment: string;
  walletAddress: string | null;
  timestamp: string;
}

async function ensureDataDir(): Promise<void> {
  await mkdir(env.DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(env.DATA_DIR, file), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDataDir();
  await writeFile(path.join(env.DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

export async function logWalletInteraction(
  interaction: Omit<WalletInteraction, 'id' | 'timestamp'>,
): Promise<WalletInteraction> {
  const records = await readJson<WalletInteraction[]>('wallet-interactions.json', []);
  const record: WalletInteraction = {
    ...interaction,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  records.push(record);
  await writeJson('wallet-interactions.json', records);
  return record;
}

export async function listWalletInteractions(): Promise<WalletInteraction[]> {
  return readJson<WalletInteraction[]>('wallet-interactions.json', []);
}

export async function saveFeedback(
  feedback: Omit<FeedbackSubmission, 'id' | 'timestamp'>,
): Promise<FeedbackSubmission> {
  const records = await readJson<FeedbackSubmission[]>('feedback.json', []);
  const record: FeedbackSubmission = {
    ...feedback,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  records.push(record);
  await writeJson('feedback.json', records);
  return record;
}

export async function listFeedback(): Promise<FeedbackSubmission[]> {
  return readJson<FeedbackSubmission[]>('feedback.json', []);
}

export async function exportPilotData(): Promise<{
  uniqueWallets: number;
  interactions: WalletInteraction[];
  feedback: FeedbackSubmission[];
}> {
  const interactions = await listWalletInteractions();
  const feedback = await listFeedback();
  const uniqueWallets = new Set(interactions.map((i) => i.walletAddress)).size;
  return { uniqueWallets, interactions, feedback };
}
