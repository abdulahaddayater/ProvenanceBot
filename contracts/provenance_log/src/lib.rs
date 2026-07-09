#![no_std]
//! ProvenanceBot Soroban contract — on-chain provenance log.
//!
//! Stores batched provenance entries keyed by incrementing id and indexed by
//! summary hash so clients can verify summaries were not swapped post-hoc.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, Address,
    BytesN, Env, Vec,
};

/// ~30 days of ledgers at ~5s/ledger (17,280 ledgers/day).
const TTL_THRESHOLD: u32 = 518_400;
/// Extend persistent entries to ~150 days when bumped.
const TTL_EXTENSION: u32 = 2_592_000;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Counter,
    Entry(u64),
    SummaryIndex(BytesN<32>),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SourceRecord {
    pub source_hash: BytesN<32>,
    pub uri_hash: BytesN<32>,
    pub retrieved_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProvenanceEntry {
    pub summary_hash: BytesN<32>,
    pub query_hash: BytesN<32>,
    pub sources: Vec<SourceRecord>,
    pub created_at: u64,
    pub submitter: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    DuplicateSummary = 2,
    EmptySources = 3,
}

#[contractevent]
pub struct ProvenanceSubmitted {
    #[topic]
    pub id: u64,
    #[topic]
    pub summary_hash: BytesN<32>,
    pub query_hash: BytesN<32>,
    pub submitter: Address,
    pub source_count: u32,
}

#[contract]
pub struct ProvenanceLog;

#[contractimpl]
impl ProvenanceLog {
    /// Store a full provenance entry (all sources batched in one write) and return its id.
    pub fn submit_provenance(
        env: Env,
        submitter: Address,
        summary_hash: BytesN<32>,
        query_hash: BytesN<32>,
        sources: Vec<SourceRecord>,
    ) -> u64 {
        submitter.require_auth();

        if sources.is_empty() {
            panic_with_error!(&env, Error::EmptySources);
        }

        let summary_key = DataKey::SummaryIndex(summary_hash.clone());
        if env.storage().persistent().has(&summary_key) {
            panic_with_error!(&env, Error::DuplicateSummary);
        }

        let id = next_id(&env);
        let source_count = sources.len() as u32;
        let created_at = env.ledger().timestamp();

        let entry = ProvenanceEntry {
            summary_hash: summary_hash.clone(),
            query_hash: query_hash.clone(),
            sources,
            created_at,
            submitter: submitter.clone(),
        };

        let entry_key = DataKey::Entry(id);

        // Single transaction: entry + summary index + counter increment.
        env.storage().persistent().set(&entry_key, &entry);
        env.storage().persistent().set(&summary_key, &id);
        bump_storage_ttl(&env, &entry_key);
        bump_storage_ttl(&env, &summary_key);

        ProvenanceSubmitted {
            id,
            summary_hash,
            query_hash,
            submitter,
            source_count,
        }
        .publish(&env);

        id
    }

    /// Read-only lookup by entry id; extends TTL so entries are not archived unexpectedly.
    pub fn get_provenance(env: Env, id: u64) -> ProvenanceEntry {
        let entry_key = DataKey::Entry(id);
        let entry: ProvenanceEntry = env
            .storage()
            .persistent()
            .get(&entry_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        let summary_key = DataKey::SummaryIndex(entry.summary_hash.clone());
        bump_storage_ttl(&env, &entry_key);
        bump_storage_ttl(&env, &summary_key);

        entry
    }

    /// Lookup by summary hash so clients can recompute a summary hash and confirm on-chain binding.
    pub fn get_provenance_by_summary_hash(
        env: Env,
        summary_hash: BytesN<32>,
    ) -> Option<ProvenanceEntry> {
        let summary_key = DataKey::SummaryIndex(summary_hash);
        let id: u64 = env.storage().persistent().get(&summary_key)?;
        let entry_key = DataKey::Entry(id);
        let entry: ProvenanceEntry = env.storage().persistent().get(&entry_key)?;

        bump_storage_ttl(&env, &entry_key);
        bump_storage_ttl(&env, &summary_key);

        Some(entry)
    }

    /// Returns whether `source_hash` appears in the stored entry without returning the full record.
    pub fn verify_source(env: Env, id: u64, source_hash: BytesN<32>) -> bool {
        let entry_key = DataKey::Entry(id);
        let entry: ProvenanceEntry = match env.storage().persistent().get(&entry_key) {
            Some(entry) => entry,
            None => return false,
        };

        let summary_key = DataKey::SummaryIndex(entry.summary_hash.clone());
        bump_storage_ttl(&env, &entry_key);
        bump_storage_ttl(&env, &summary_key);

        for i in 0..entry.sources.len() {
            if entry.sources.get(i).unwrap().source_hash == source_hash {
                return true;
            }
        }
        false
    }

    /// Explicit TTL bump for entries that have not been read recently.
    pub fn bump_ttl(env: Env, id: u64) {
        let entry_key = DataKey::Entry(id);
        let entry: ProvenanceEntry = env
            .storage()
            .persistent()
            .get(&entry_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        let summary_key = DataKey::SummaryIndex(entry.summary_hash);
        bump_storage_ttl(&env, &entry_key);
        bump_storage_ttl(&env, &summary_key);
    }
}

fn next_id(env: &Env) -> u64 {
    let counter_key = DataKey::Counter;
    let current: u64 = env.storage().persistent().get(&counter_key).unwrap_or(0);
    let next = current + 1;
    env.storage().persistent().set(&counter_key, &next);
    next
}

fn bump_storage_ttl(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_THRESHOLD, TTL_EXTENSION);
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::testutils::storage::Persistent;
    use soroban_sdk::{Address, BytesN, Env};

    fn hash(env: &Env, byte: u8) -> BytesN<32> {
        BytesN::from_array(env, &[byte; 32])
    }

    fn sample_sources(env: &Env) -> Vec<SourceRecord> {
        let mut sources = Vec::new(env);
        sources.push_back(SourceRecord {
            source_hash: hash(env, 1),
            uri_hash: hash(env, 2),
            retrieved_at: 1_000,
        });
        sources.push_back(SourceRecord {
            source_hash: hash(env, 3),
            uri_hash: hash(env, 4),
            retrieved_at: 2_000,
        });
        sources
    }

    fn setup() -> (Env, Address, ProvenanceLogClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(ProvenanceLog, ());
        let client = ProvenanceLogClient::new(&env, &contract_id);
        let submitter = Address::generate(&env);
        (env, submitter, client)
    }

    #[test]
    fn submit_provenance_stores_batched_entry() {
        let (env, submitter, client) = setup();
        let summary_hash = hash(&env, 10);
        let query_hash = hash(&env, 11);
        let sources = sample_sources(&env);

        let id = client.submit_provenance(&submitter, &summary_hash, &query_hash, &sources);

        assert_eq!(id, 1);
        let entry = client.get_provenance(&id);
        assert_eq!(entry.summary_hash, summary_hash);
        assert_eq!(entry.query_hash, query_hash);
        assert_eq!(entry.submitter, submitter);
        assert_eq!(entry.sources.len(), 2);
        assert_eq!(entry.sources.get(0).unwrap().source_hash, hash(&env, 1));
        assert_eq!(entry.sources.get(1).unwrap().source_hash, hash(&env, 3));
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #2)")]
    fn rejects_duplicate_summary_hash() {
        let (env, submitter, client) = setup();
        let summary_hash = hash(&env, 20);
        let query_hash = hash(&env, 21);
        let sources = sample_sources(&env);

        client.submit_provenance(&submitter, &summary_hash, &query_hash, &sources);
        client.submit_provenance(&submitter, &summary_hash, &query_hash, &sources);
    }

    #[test]
    #[should_panic]
    fn rejects_unauthorized_submitter() {
        let env = Env::default();
        let contract_id = env.register(ProvenanceLog, ());
        let client = ProvenanceLogClient::new(&env, &contract_id);
        let submitter = Address::generate(&env);

        client.submit_provenance(
            &submitter,
            &hash(&env, 30),
            &hash(&env, 31),
            &sample_sources(&env),
        );
    }

    #[test]
    fn verify_source_returns_true_and_false() {
        let (env, submitter, client) = setup();
        let id = client.submit_provenance(
            &submitter,
            &hash(&env, 40),
            &hash(&env, 41),
            &sample_sources(&env),
        );

        assert!(client.verify_source(&id, &hash(&env, 1)));
        assert!(client.verify_source(&id, &hash(&env, 3)));
        assert!(!client.verify_source(&id, &hash(&env, 99)));
        assert!(!client.verify_source(&999, &hash(&env, 1)));
    }

    #[test]
    fn get_provenance_by_summary_hash_returns_entry() {
        let (env, submitter, client) = setup();
        let summary_hash = hash(&env, 50);
        let query_hash = hash(&env, 51);

        let id = client.submit_provenance(
            &submitter,
            &summary_hash,
            &query_hash,
            &sample_sources(&env),
        );

        let entry = client
            .get_provenance_by_summary_hash(&summary_hash)
            .expect("entry should exist");
        assert_eq!(entry.summary_hash, summary_hash);
        assert_eq!(client.get_provenance(&id).query_hash, query_hash);
        assert!(client.get_provenance_by_summary_hash(&hash(&env, 52)).is_none());
    }

    #[test]
    fn extend_ttl_on_read() {
        let (env, submitter, client) = setup();
        let contract_id = client.address.clone();
        let id = client.submit_provenance(
            &submitter,
            &hash(&env, 60),
            &hash(&env, 61),
            &sample_sources(&env),
        );

        let entry_key = DataKey::Entry(id);
        let ttl_before = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });
        assert!(ttl_before > TTL_THRESHOLD);

        // Drop remaining TTL to just below the extension threshold.
        env.ledger().with_mut(|li| {
            li.sequence_number += ttl_before - TTL_THRESHOLD + 100;
        });

        let ttl_mid = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });
        assert!(ttl_mid < TTL_THRESHOLD);

        let _ = client.get_provenance(&id);

        let ttl_after = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });
        assert!(ttl_after > ttl_mid);
        assert!(ttl_after >= TTL_THRESHOLD);
    }

    #[test]
    fn bump_ttl_extends_entry() {
        let (env, submitter, client) = setup();
        let contract_id = client.address.clone();
        let id = client.submit_provenance(
            &submitter,
            &hash(&env, 70),
            &hash(&env, 71),
            &sample_sources(&env),
        );

        let entry_key = DataKey::Entry(id);
        let ttl_before = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });

        env.ledger().with_mut(|li| {
            li.sequence_number += ttl_before - TTL_THRESHOLD + 100;
        });

        let ttl_mid = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });
        assert!(ttl_mid < TTL_THRESHOLD);

        client.bump_ttl(&id);

        let ttl_after = env.as_contract(&contract_id, || {
            env.storage().persistent().get_ttl(&entry_key)
        });
        assert!(ttl_after > ttl_mid);
        assert!(ttl_after >= TTL_THRESHOLD);
    }
}
