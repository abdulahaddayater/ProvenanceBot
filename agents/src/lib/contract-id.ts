import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadContractId(): string {
  if (env.PROVENANCE_CONTRACT_ID) {
    return env.PROVENANCE_CONTRACT_ID;
  }
  const idPath = path.resolve(__dirname, '../../../contracts/testnet-contract-id.txt');
  try {
    return readFileSync(idPath, 'utf8').trim();
  } catch {
    return '';
  }
}
