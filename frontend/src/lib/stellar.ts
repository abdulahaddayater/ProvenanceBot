/**
 * Frontend ↔ Soroban contract integration surface.
 *
 * Maps 1:1 to `contracts/provenance_log/src/lib.rs` (`#[contractimpl]` methods)
 * and is used by the UI + Next.js API routes that call the agents Soroban client.
 */
import { Networks, StrKey } from '@stellar/stellar-sdk';
import { publicConfig } from './config';

/** Contract methods exposed by provenance_log — keep in sync with lib.rs */
export const PROVENANCE_CONTRACT_METHODS = {
  /** Batch-write sources + summary hash; returns entry id */
  submit_provenance: 'submit_provenance',
  /** Lookup entry by id */
  get_provenance: 'get_provenance',
  /** Lookup entry by summary hash */
  get_provenance_by_summary_hash: 'get_provenance_by_summary_hash',
  /** Check whether a source hash is in a provenance entry */
  verify_source: 'verify_source',
} as const;

export type ProvenanceContractMethod =
  (typeof PROVENANCE_CONTRACT_METHODS)[keyof typeof PROVENANCE_CONTRACT_METHODS];

/** How the browser UI reaches each contract method */
export const CONTRACT_INTEGRATION_PATH = {
  submit_provenance: {
    ui: 'QueryForm → POST /api/query → agents pipeline → soroban.submitProvenance',
    contractMethod: PROVENANCE_CONTRACT_METHODS.submit_provenance,
  },
  verify_source: {
    ui: 'SourcePanel → GET /api/verify-onchain → soroban.verifySource',
    contractMethod: PROVENANCE_CONTRACT_METHODS.verify_source,
  },
  get_provenance: {
    ui: 'Status / admin health → getSorobanClient contract id + RPC',
    contractMethod: PROVENANCE_CONTRACT_METHODS.get_provenance,
  },
  get_provenance_by_summary_hash: {
    ui: 'Independent verification (README / Stellar Lab)',
    contractMethod: PROVENANCE_CONTRACT_METHODS.get_provenance_by_summary_hash,
  },
} as const;

export function getStellarNetworkPassphrase(): string {
  return publicConfig.networkPassphrase.includes('Test')
    ? Networks.TESTNET
    : publicConfig.networkPassphrase;
}

export function getProvenanceContractId(): string {
  return publicConfig.provenanceContractId;
}

/** Validate the deployed contract id is a proper Stellar contract address (C...). */
export function isValidContractId(id: string = getProvenanceContractId()): boolean {
  try {
    return StrKey.isValidContract(id);
  } catch {
    return false;
  }
}

export function getSorobanExplorerContractUrl(
  contractId: string = getProvenanceContractId(),
): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

export function getContractLabUrl(contractId: string = getProvenanceContractId()): string {
  return `https://lab.stellar.org/r/testnet/contract/${contractId}`;
}

/** Payload the UI sends when verifying a citation on-chain (verify_source). */
export interface VerifySourceRequest {
  method: typeof PROVENANCE_CONTRACT_METHODS.verify_source;
  entryId: number;
  sourceHash: string;
  contractId: string;
}

export function buildVerifySourceRequest(
  entryId: number,
  sourceHash: string,
): VerifySourceRequest {
  return {
    method: PROVENANCE_CONTRACT_METHODS.verify_source,
    entryId,
    sourceHash,
    contractId: getProvenanceContractId(),
  };
}
