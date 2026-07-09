import {
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  scValToNative,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
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

function bytesN32ScVal(hex: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(hexToBytes32(hex));
}

function sourceRecordScVal(record: SourceRecordInput): xdr.ScVal {
  return xdr.ScVal.scvMap(
    new xdr.ScMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('source_hash'),
        val: bytesN32ScVal(record.sourceHash),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('uri_hash'),
        val: bytesN32ScVal(record.uriHash),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('retrieved_at'),
        val: nativeToScVal(record.retrievedAt, { type: 'u64' }),
      }),
    ]),
  );
}

export class SorobanProvenanceClient {
  private readonly server: rpc.Server;
  private readonly contractId: string;
  private readonly keypair: Keypair | null;

  constructor() {
    this.server = new rpc.Server(env.SOROBAN_RPC_URL);
    this.contractId = loadContractId();
    this.keypair = env.STELLAR_SECRET_KEY ? Keypair.fromSecret(env.STELLAR_SECRET_KEY) : null;
  }

  isConfigured(): boolean {
    return Boolean(this.contractId && this.keypair);
  }

  getContractId(): string {
    return this.contractId;
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

    const contract = new Contract(this.contractId);
    const account = await this.server.getAccount(this.keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: env.STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'submit_provenance',
          Address.fromString(this.keypair.publicKey()).toScVal(),
          bytesN32ScVal(summaryHash),
          bytesN32ScVal(queryHash),
          xdr.ScVal.scvVec(sources.map(sourceRecordScVal)),
        ),
      )
      .setTimeout(180)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    prepared.sign(this.keypair);

    const sendResponse = await this.server.sendTransaction(prepared);
    if (sendResponse.status === 'ERROR') {
      throw new Error(`Transaction failed: ${JSON.stringify(sendResponse.errorResult)}`);
    }

    let getResponse = await this.server.getTransaction(sendResponse.hash);
    let attempts = 0;
    while (getResponse.status === 'NOT_FOUND' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      getResponse = await this.server.getTransaction(sendResponse.hash);
      attempts++;
    }

    if (getResponse.status !== 'SUCCESS') {
      throw new Error(`Transaction ${getResponse.status}: ${sendResponse.hash}`);
    }

    const returnValue = getResponse.returnValue;
    const entryId = returnValue ? Number(scValToNative(returnValue)) : 0;

    return {
      entryId,
      txHash: sendResponse.hash,
      contractId: this.contractId,
    };
  }

  async verifySource(entryId: number, sourceHash: string): Promise<boolean> {
    if (!this.contractId || !this.keypair) return false;

    const contract = new Contract(this.contractId);
    const account = await this.server.getAccount(this.keypair.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: env.STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'verify_source',
          nativeToScVal(entryId, { type: 'u64' }),
          bytesN32ScVal(sourceHash),
        ),
      )
      .setTimeout(30)
      .build();

    const sim = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      return false;
    }
    const val = sim.result?.retval;
    return val ? Boolean(scValToNative(val)) : false;
  }
}

let client: SorobanProvenanceClient | null = null;

export function getSorobanClient(): SorobanProvenanceClient {
  if (!client) {
    client = new SorobanProvenanceClient();
  }
  return client;
}
