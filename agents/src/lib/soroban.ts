import { Keypair } from '@stellar/stellar-sdk';
import { basicNodeSigner } from '@stellar/stellar-sdk/contract';
import { Client, type SourceRecord } from '../bindings/src/index.js';
import { env } from '../config/env.js';
import { hexToBytes32 } from './hash.js';
import { loadContractId } from './contract-id.js';

export interface SourceRecordInput {
  sourceHash: string;
  uriHash: string;
  retrievedAt: number;
}

export interface SubmitProvenanceResult {
  entryId: number;
  txHash: string;
  contractId: string;
}

function toSourceRecord(input: SourceRecordInput): SourceRecord {
  return {
    source_hash: hexToBytes32(input.sourceHash),
    uri_hash: hexToBytes32(input.uriHash),
    retrieved_at: BigInt(input.retrievedAt),
  };
}

function loadKeypair(): Keypair | null {
  const secret = env.STELLAR_SECRET_KEY?.trim();
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret);
  } catch {
    return null;
  }
}

export class SorobanProvenanceClient {
  private readonly contractId: string;
  private readonly keypair: Keypair | null;

  constructor() {
    this.contractId = loadContractId();
    this.keypair = loadKeypair();
  }

  isConfigured(): boolean {
    return Boolean(this.contractId && this.keypair);
  }

  getContractId(): string {
    return this.contractId;
  }

  private createClient(): Client {
    if (!this.keypair) throw new Error('Keypair not configured');
    const signer = basicNodeSigner(this.keypair, env.STELLAR_NETWORK_PASSPHRASE);
    return new Client({
      contractId: this.contractId,
      networkPassphrase: env.STELLAR_NETWORK_PASSPHRASE,
      rpcUrl: env.SOROBAN_RPC_URL,
      publicKey: this.keypair.publicKey(),
      ...signer,
    });
  }

  async submitProvenance(
    summaryHash: string,
    queryHash: string,
    sources: SourceRecordInput[],
  ): Promise<SubmitProvenanceResult> {
    if (!this.isConfigured() || !this.keypair) {
      throw new Error(
        'Soroban client not configured — set PROVENANCE_CONTRACT_ID and STELLAR_SECRET_KEY',
      );
    }

    const client = this.createClient();
    const assembled = await client.submit_provenance({
      submitter: this.keypair.publicKey(),
      summary_hash: hexToBytes32(summaryHash),
      query_hash: hexToBytes32(queryHash),
      sources: sources.map(toSourceRecord),
    });

    const sent = await assembled.signAndSend();
    const txHash = sent.sendTransactionResponse?.hash;
    if (!txHash) {
      throw new Error('Soroban submit succeeded but transaction hash was not returned');
    }

    return {
      entryId: Number(sent.result),
      txHash,
      contractId: this.contractId,
    };
  }

  async verifySource(entryId: number, sourceHash: string): Promise<boolean> {
    if (!this.contractId || !this.keypair) return false;

    const client = this.createClient();
    const assembled = await client.verify_source({
      id: BigInt(entryId),
      source_hash: hexToBytes32(sourceHash),
    });
    return assembled.result ?? false;
  }
}

let client: SorobanProvenanceClient | null = null;

export function getSorobanClient(): SorobanProvenanceClient {
  if (!client) {
    client = new SorobanProvenanceClient();
  }
  return client;
}
