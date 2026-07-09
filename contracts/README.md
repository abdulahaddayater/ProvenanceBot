# ProvenanceBot Soroban Contracts

Rust workspace for the on-chain provenance registry deployed to Stellar/Soroban.

## Structure

```
contracts/
├── Cargo.toml                 # Workspace root
├── deploy.sh                  # Build, optimize, deploy to testnet
├── testnet-contract-id.txt    # Written by deploy.sh (git-tracked after deploy)
└── provenance_log/            # Provenance log contract
    ├── Cargo.toml
    └── src/lib.rs
```

## Contract: `provenance_log`

Anchors batched provenance records on-chain so summaries cannot be swapped after the fact.

### Data model

| Type | Fields |
|------|--------|
| `SourceRecord` | `source_hash: BytesN<32>`, `uri_hash: BytesN<32>`, `retrieved_at: u64` |
| `ProvenanceEntry` | `summary_hash`, `query_hash`, `sources: Vec<SourceRecord>`, `created_at`, `submitter: Address` |

### Functions

| Function | Description |
|----------|-------------|
| `submit_provenance` | Auth-gated batch write of one entry (all sources in a single transaction). Returns entry id. Emits `ProvenanceSubmitted` event. |
| `get_provenance(id)` | Read entry by id; extends TTL on read. |
| `get_provenance_by_summary_hash(summary_hash)` | Lookup by summary hash for post-hoc verification. |
| `verify_source(id, source_hash)` | Returns `bool` for a single citation chip without returning the full entry. |
| `bump_ttl(id)` | Explicit TTL extension for archival safety. |

### Storage layout (persistent)

| Key | Value | Purpose |
|-----|-------|---------|
| `DataKey::Counter` | `u64` | Monotonic id counter |
| `DataKey::Entry(id)` | `ProvenanceEntry` | Full batched record |
| `DataKey::SummaryIndex(summary_hash)` | `u64` | Summary hash → entry id |

All entry and index keys use `extend_ttl(threshold=518_400, extend_to=2_592_000)` (~30-day threshold, ~150-day target) on write and on read via `get_*`, `verify_source`, and `bump_ttl`.

### Fee / cost characteristics

**Batch write (this contract):** `submit_provenance` performs **one** persistent write for the full `ProvenanceEntry` (including the entire `sources` vector), plus one index write and one counter update — all in **one transaction**. Footprint and fees scale with total entry size but you pay **one** invocation fee.

**Per-source write (anti-pattern):** Writing each `SourceRecord` in a separate transaction would multiply:
- Base transaction fee × number of sources
- Separate auth / footprint overhead per call
- No atomic guarantee that all sources belong to the same query

For a query with *N* sources, batching is roughly **O(1) transactions** vs **O(N) transactions** for per-source writes.

### Summary hash binding (anti swap)

1. Off-chain, the agent computes `summary_hash = SHA-256(canonical_summary_bytes)`.
2. `submit_provenance` stores that hash immutably in `ProvenanceEntry.summary_hash` and registers `SummaryIndex(summary_hash) → id`.
3. Duplicate `summary_hash` submissions are rejected (`Error::DuplicateSummary`).
4. To verify, the frontend recomputes the hash from the displayed summary and calls `get_provenance_by_summary_hash`. If the on-chain entry matches, the summary shown to the user is bound to the exact sources stored at submission time — changing the summary text would produce a different hash and fail lookup.

## Prerequisites

- Rust **1.91.0** (pinned via `rust-toolchain.toml`; required by soroban-sdk 27)
- If `stellar contract build` rejects the toolchain, use `cargo build` + `stellar contract optimize` (see `deploy.sh`)
- Target `wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools) with `opt` feature

```bash
rustup target add wasm32v1-none
cargo install --locked stellar-cli --features opt
```

Configure a funded testnet identity (default name: `deployer`):

```bash
stellar keys generate deployer --network testnet
# fund via https://lab.stellar.org/account/create?network=testnet
```

## Build

```bash
cd contracts
stellar contract build --package provenance_log --optimize
# or
cargo build --release --target wasm32v1-none -p provenance_log
```

Wasm output: `target/wasm32v1-none/release/provenance_log.wasm`

## Test

```bash
cd contracts
cargo test -p provenance_log
```

The workspace pins `ed25519-dalek` 2.x via `[patch.crates-io]` so soroban-env-host testutils compile with rand 0.8.

Covers: successful submission, duplicate summary rejection, unauthorized submitter, `verify_source` true/false, and TTL extension on read / explicit bump.

## Deploy (testnet)

```bash
cd contracts
chmod +x deploy.sh
./deploy.sh
```

Environment overrides:

| Variable | Default | Description |
|----------|---------|-------------|
| `STELLAR_SOURCE_ACCOUNT` | `deployer` | Signing identity |
| `STELLAR_NETWORK` | `testnet` | Target network |

Contract id is written to `contracts/testnet-contract-id.txt` for frontend/agents consumption.

```bash
# agents/.env / frontend/.env
PROVENANCE_CONTRACT_ID=<from testnet-contract-id.txt>
```
