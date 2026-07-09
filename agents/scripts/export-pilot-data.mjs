#!/usr/bin/env node
/**
 * Export pilot data (wallet interactions + feedback) as JSON/CSV for submission evidence.
 * Usage: node scripts/export-pilot-data.mjs [--format=json|csv]
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const format = process.argv.includes('--format=csv') ? 'csv' : 'json';

async function readJson(file) {
  try {
    return JSON.parse(await readFile(path.join(dataDir, file), 'utf8'));
  } catch {
    return [];
  }
}

const interactions = await readJson('wallet-interactions.json');
const feedback = await readJson('feedback.json');
const uniqueWallets = new Set(interactions.map((i) => i.walletAddress)).size;

const payload = {
  exportedAt: new Date().toISOString(),
  uniqueWallets,
  interactionCount: interactions.length,
  feedbackCount: feedback.length,
  interactions,
  feedback,
};

if (format === 'csv') {
  const header = 'walletAddress,entryId,txHash,query,timestamp\n';
  const rows = interactions
    .map(
      (i) =>
        `"${i.walletAddress}","${i.entryId ?? ''}","${i.txHash ?? ''}","${(i.query ?? '').replace(/"/g, '""')}","${i.timestamp}"`,
    )
    .join('\n');
  await writeFile('pilot-export.csv', header + rows);
  console.log('Wrote pilot-export.csv');
} else {
  await writeFile('pilot-export.json', JSON.stringify(payload, null, 2));
  console.log('Wrote pilot-export.json');
}

console.log(`Unique wallets: ${uniqueWallets}`);
console.log(`Interactions: ${interactions.length}`);
console.log(`Feedback: ${feedback.length}`);
