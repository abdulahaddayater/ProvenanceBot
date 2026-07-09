// @ts-nocheck — generated Soroban contract bindings
import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAB2CE4EYPPZ6WKNVNBR3OM2AQETZFUISXDV2AJATYZTWCTMJ64EHP32",
  }
} as const

export const Errors = {
  1: {message:"NotFound"},
  2: {message:"DuplicateSummary"},
  3: {message:"EmptySources"}
}

export type DataKey = {tag: "Counter", values: void} | {tag: "Entry", values: readonly [u64]} | {tag: "SummaryIndex", values: readonly [Buffer]};


export interface SourceRecord {
  retrieved_at: u64;
  source_hash: Buffer;
  uri_hash: Buffer;
}


export interface ProvenanceEntry {
  created_at: u64;
  query_hash: Buffer;
  sources: Array<SourceRecord>;
  submitter: string;
  summary_hash: Buffer;
}


export interface Client {
  /**
   * Construct and simulate a bump_ttl transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Explicit TTL bump for entries that have not been read recently.
   */
  bump_ttl: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a verify_source transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns whether `source_hash` appears in the stored entry without returning the full record.
   */
  verify_source: ({id, source_hash}: {id: u64, source_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_provenance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only lookup by entry id; extends TTL so entries are not archived unexpectedly.
   */
  get_provenance: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<ProvenanceEntry>>

  /**
   * Construct and simulate a submit_provenance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Store a full provenance entry (all sources batched in one write) and return its id.
   */
  submit_provenance: ({submitter, summary_hash, query_hash, sources}: {submitter: string, summary_hash: Buffer, query_hash: Buffer, sources: Array<SourceRecord>}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_provenance_by_summary_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lookup by summary hash so clients can recompute a summary hash and confirm on-chain binding.
   */
  get_provenance_by_summary_hash: ({summary_hash}: {summary_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<ProvenanceEntry>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAAwAAAAAAAAAITm90Rm91bmQAAAABAAAAAAAAABBEdXBsaWNhdGVTdW1tYXJ5AAAAAgAAAAAAAAAMRW1wdHlTb3VyY2VzAAAAAw==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAB0NvdW50ZXIAAAAAAQAAAAAAAAAFRW50cnkAAAAAAAABAAAABgAAAAEAAAAAAAAADFN1bW1hcnlJbmRleAAAAAEAAAPuAAAAIA==",
        "AAAAAQAAAAAAAAAAAAAADFNvdXJjZVJlY29yZAAAAAMAAAAAAAAADHJldHJpZXZlZF9hdAAAAAYAAAAAAAAAC3NvdXJjZV9oYXNoAAAAA+4AAAAgAAAAAAAAAAh1cmlfaGFzaAAAA+4AAAAg",
        "AAAAAAAAAD9FeHBsaWNpdCBUVEwgYnVtcCBmb3IgZW50cmllcyB0aGF0IGhhdmUgbm90IGJlZW4gcmVhZCByZWNlbnRseS4AAAAACGJ1bXBfdHRsAAAAAQAAAAAAAAACaWQAAAAAAAYAAAAA",
        "AAAAAQAAAAAAAAAAAAAAD1Byb3ZlbmFuY2VFbnRyeQAAAAAFAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAApxdWVyeV9oYXNoAAAAAAPuAAAAIAAAAAAAAAAHc291cmNlcwAAAAPqAAAH0AAAAAxTb3VyY2VSZWNvcmQAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAADHN1bW1hcnlfaGFzaAAAA+4AAAAg",
        "AAAAAAAAAFxSZXR1cm5zIHdoZXRoZXIgYHNvdXJjZV9oYXNoYCBhcHBlYXJzIGluIHRoZSBzdG9yZWQgZW50cnkgd2l0aG91dCByZXR1cm5pbmcgdGhlIGZ1bGwgcmVjb3JkLgAAAA12ZXJpZnlfc291cmNlAAAAAAAAAgAAAAAAAAACaWQAAAAAAAYAAAAAAAAAC3NvdXJjZV9oYXNoAAAAA+4AAAAgAAAAAQAAAAE=",
        "AAAABQAAAAAAAAAAAAAAE1Byb3ZlbmFuY2VTdWJtaXR0ZWQAAAAAAQAAABRwcm92ZW5hbmNlX3N1Ym1pdHRlZAAAAAUAAAAAAAAAAmlkAAAAAAAGAAAAAQAAAAAAAAAMc3VtbWFyeV9oYXNoAAAD7gAAACAAAAABAAAAAAAAAApxdWVyeV9oYXNoAAAAAAPuAAAAIAAAAAAAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAAAAAAAAxzb3VyY2VfY291bnQAAAAEAAAAAAAAAAI=",
        "AAAAAAAAAFNSZWFkLW9ubHkgbG9va3VwIGJ5IGVudHJ5IGlkOyBleHRlbmRzIFRUTCBzbyBlbnRyaWVzIGFyZSBub3QgYXJjaGl2ZWQgdW5leHBlY3RlZGx5LgAAAAAOZ2V0X3Byb3ZlbmFuY2UAAAAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAB9AAAAAPUHJvdmVuYW5jZUVudHJ5AA==",
        "AAAAAAAAAFNTdG9yZSBhIGZ1bGwgcHJvdmVuYW5jZSBlbnRyeSAoYWxsIHNvdXJjZXMgYmF0Y2hlZCBpbiBvbmUgd3JpdGUpIGFuZCByZXR1cm4gaXRzIGlkLgAAAAARc3VibWl0X3Byb3ZlbmFuY2UAAAAAAAAEAAAAAAAAAAlzdWJtaXR0ZXIAAAAAAAATAAAAAAAAAAxzdW1tYXJ5X2hhc2gAAAPuAAAAIAAAAAAAAAAKcXVlcnlfaGFzaAAAAAAD7gAAACAAAAAAAAAAB3NvdXJjZXMAAAAD6gAAB9AAAAAMU291cmNlUmVjb3JkAAAAAQAAAAY=",
        "AAAAAAAAAFxMb29rdXAgYnkgc3VtbWFyeSBoYXNoIHNvIGNsaWVudHMgY2FuIHJlY29tcHV0ZSBhIHN1bW1hcnkgaGFzaCBhbmQgY29uZmlybSBvbi1jaGFpbiBiaW5kaW5nLgAAAB5nZXRfcHJvdmVuYW5jZV9ieV9zdW1tYXJ5X2hhc2gAAAAAAAEAAAAAAAAADHN1bW1hcnlfaGFzaAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAAD1Byb3ZlbmFuY2VFbnRyeQA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    bump_ttl: this.txFromJSON<null>,
        verify_source: this.txFromJSON<boolean>,
        get_provenance: this.txFromJSON<ProvenanceEntry>,
        submit_provenance: this.txFromJSON<u64>,
        get_provenance_by_summary_hash: this.txFromJSON<Option<ProvenanceEntry>>
  }
}