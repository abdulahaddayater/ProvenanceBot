import { describe, expect, it } from 'vitest';
import {
  PROVENANCE_CONTRACT_METHODS,
  buildVerifySourceRequest,
  getProvenanceContractId,
  getStellarNetworkPassphrase,
  isValidContractId,
} from './stellar';
import { Networks } from '@stellar/stellar-sdk';

describe('stellar contract integration', () => {
  it('exposes all provenance_log contract methods from lib.rs', () => {
    expect(PROVENANCE_CONTRACT_METHODS.submit_provenance).toBe('submit_provenance');
    expect(PROVENANCE_CONTRACT_METHODS.verify_source).toBe('verify_source');
    expect(PROVENANCE_CONTRACT_METHODS.get_provenance).toBe('get_provenance');
    expect(PROVENANCE_CONTRACT_METHODS.get_provenance_by_summary_hash).toBe(
      'get_provenance_by_summary_hash',
    );
  });

  it('uses Stellar testnet passphrase via stellar-sdk Networks', () => {
    expect(getStellarNetworkPassphrase()).toBe(Networks.TESTNET);
  });

  it('validates the deployed contract id with stellar-sdk StrKey', () => {
    const id = getProvenanceContractId();
    expect(id.startsWith('C')).toBe(true);
    expect(isValidContractId(id)).toBe(true);
  });

  it('builds a verify_source request matching contract args', () => {
    const req = buildVerifySourceRequest(1, 'abc');
    expect(req.method).toBe('verify_source');
    expect(req.entryId).toBe(1);
    expect(req.sourceHash).toBe('abc');
    expect(req.contractId).toBe(getProvenanceContractId());
  });
});
