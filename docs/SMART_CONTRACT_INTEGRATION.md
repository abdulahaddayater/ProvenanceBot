# Smart Contract ↔ Frontend Integration

This document maps `provenance_log` contract methods to frontend code so reviewers can verify Stellar integration without guessing.

## Contract (testnet)

- **ID:** `CAB2CE4EYPPZ6WKNVNBR3OM2AQETZFUISXDV2AJATYZTWCTMJ64EHP32`
- **Source:** `contracts/provenance_log/src/lib.rs`
- **Deploy:** `contracts/deploy.sh` (+ CD workflow `.github/workflows/cd.yml`)

## Method mapping

| Contract method (`lib.rs`) | Frontend / API entry | Soroban client |
|----------------------------|----------------------|----------------|
| `submit_provenance` | `QueryForm` → `POST /api/query` → pipeline | `agents/src/lib/soroban.ts` → `submitProvenance` |
| `verify_source` | `SourcePanel` → `GET /api/verify-onchain` | `agents/src/lib/soroban.ts` → `verifySource` |
| `get_provenance` | Status / health contract metadata | bindings + RPC |
| `get_provenance_by_summary_hash` | Independent verify (README / Lab) | bindings |

## Key frontend files

| File | Role |
|------|------|
| `frontend/src/hooks/useWallet.tsx` | Freighter wallet connect/disconnect (`@stellar/freighter-api`) |
| `frontend/src/lib/stellar.ts` | Contract method constants + `@stellar/stellar-sdk` (`Networks`, `StrKey`) |
| `frontend/src/lib/api.ts` | Browser API client (`submitQuery`, `verifyOnChain`) |
| `frontend/src/app/api/query/route.ts` | Server route → agents pipeline → `submit_provenance` |
| `frontend/src/app/api/verify-onchain/route.ts` | Server route → `verify_source` |
| `frontend/src/components/SourcePanel.tsx` | "Verify on-chain" UI wired to `verify_source` |

## Architecture

```
Browser (Freighter + UI)
  → Next.js /api/* (same origin)
    → @provenancebot/agents Soroban client
      → provenance_log on Stellar testnet
```

Wallet address is passed for attribution; server signs Soroban txs with `STELLAR_SECRET_KEY` during the pilot (documented limitation).
