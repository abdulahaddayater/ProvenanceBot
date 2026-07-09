import { describe, expect, it } from 'vitest';
import { orchestrateQuery } from '../orchestration/pipeline.js';

const hasTestnetKey = Boolean(process.env.STELLAR_SECRET_KEY);

describe.skipIf(!hasTestnetKey)('testnet integration', () => {
  it(
    'anchors a provenance record on testnet',
    async () => {
      const uniqueQuery = `integration test query for provenance ${Date.now()}`;
      const result = await orchestrateQuery(uniqueQuery, {
        walletAddress: 'GTEST000000000000000000000000000000000000000000000000000000000',
      });

      expect(result.status).not.toBe('error');
      expect(result.provenance.entryId).toBeGreaterThan(0);
      expect(result.provenance.txHash).toBeTruthy();
    },
    120_000,
  );
});
