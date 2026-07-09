/** Ensure serverless-friendly paths and contract config on Vercel. */
export function ensureServerEnv(): void {
  if (!process.env.DATA_DIR) {
    process.env.DATA_DIR = '/tmp/provenancebot/data';
  }
  if (!process.env.CONTENT_ARCHIVE_DIR) {
    process.env.CONTENT_ARCHIVE_DIR = '/tmp/provenancebot/content-archive';
  }
  if (!process.env.PROVENANCE_CONTRACT_ID && process.env.NEXT_PUBLIC_PROVENANCE_CONTRACT_ID) {
    process.env.PROVENANCE_CONTRACT_ID = process.env.NEXT_PUBLIC_PROVENANCE_CONTRACT_ID;
  }
  if (!process.env.STELLAR_NETWORK_PASSPHRASE && process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE) {
    process.env.STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE;
  }
  if (!process.env.SOROBAN_RPC_URL && process.env.NEXT_PUBLIC_SOROBAN_RPC_URL) {
    process.env.SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;
  }
}
