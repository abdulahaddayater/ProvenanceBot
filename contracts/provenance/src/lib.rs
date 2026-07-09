#![no_std]
//! ProvenanceBot Soroban contract — scaffolding only.
//!
//! Stores batched provenance records: source hashes, summary hash, and timestamps.
//! Business logic (record / verify) will be implemented in a later commit.
//!
//! Note: host `testutils` are omitted from the scaffold for now because
//! `soroban-env-host` currently resolves an incompatible `ed25519-dalek` 3.x
//! against `rand` 0.8. Contract unit tests will return with the Notary/record APIs.

use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct ProvenanceContract;

#[contractimpl]
impl ProvenanceContract {
    /// Placeholder entrypoint — returns a static greeting until provenance APIs land.
    pub fn ping(env: Env) -> soroban_sdk::Symbol {
        let _ = env;
        soroban_sdk::symbol_short!("pong")
    }
}
