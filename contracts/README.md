# ProvenanceBot Soroban Contracts

Rust workspace for the on-chain provenance registry deployed to Stellar/Soroban.

## Structure

```
contracts/
├── Cargo.toml              # Workspace root
└── provenance/             # Provenance registry contract
    ├── Cargo.toml
    └── src/lib.rs
```

## Prerequisites

- Rust **1.91.0** (pinned via `rust-toolchain.toml` in this directory)
- Target `wasm32v1-none` (required by Soroban SDK 26+ on Rust 1.84+)
- [Soroban / Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools) (optional until deploy)

```bash
# Toolchain is auto-selected when you `cd contracts`
rustup target add wasm32v1-none
cargo install --locked stellar-cli --features opt
```

## Build

```bash
cd contracts
cargo build --release --target wasm32v1-none -p provenance
```

## Test / check

Host `testutils` are deferred until the Notary/record APIs land (upstream
`soroban-env-host` currently has an `ed25519-dalek` / `rand` version clash).

```bash
cd contracts
cargo check -p provenance
```

## Deploy (placeholder)

Contract ID and network settings live in `agents/.env` and `frontend/.env` after deployment.
Business logic (`record_batch`, `verify_source`, etc.) is intentionally not implemented yet.
