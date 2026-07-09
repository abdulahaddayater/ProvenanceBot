#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONTRACT_PKG="provenance_log"
OUT_FILE="$SCRIPT_DIR/testnet-contract-id.txt"
SOURCE_ACCOUNT="${STELLAR_SOURCE_ACCOUNT:-deployer}"
NETWORK="${STELLAR_NETWORK:-testnet}"
WASM="$SCRIPT_DIR/target/wasm32v1-none/release/${CONTRACT_PKG}.wasm"
OPT_WASM="${WASM%.wasm}.optimized.wasm"

echo "==> Building ${CONTRACT_PKG} (release wasm)..."
if stellar contract build --package "$CONTRACT_PKG" --profile release --optimize 2>/dev/null; then
  echo "    Built via stellar contract build"
else
  echo "    stellar contract build unavailable (rustc pin); falling back to cargo + optimize"
  cargo build --release --target wasm32v1-none -p "$CONTRACT_PKG"
  stellar contract optimize --wasm "$WASM"
fi

DEPLOY_WASM="$OPT_WASM"
if [[ ! -f "$DEPLOY_WASM" ]]; then
  DEPLOY_WASM="$WASM"
fi

if [[ ! -f "$DEPLOY_WASM" ]]; then
  echo "ERROR: wasm not found at $DEPLOY_WASM" >&2
  exit 1
fi

echo "==> Deploying to Stellar ${NETWORK} as ${SOURCE_ACCOUNT}..."
CONTRACT_ID="$(
  stellar contract deploy \
    --wasm "$DEPLOY_WASM" \
    --source-account "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --ignore-checks \
    --alias "provenance_log_${NETWORK}" \
    -- \
  | tail -n 1
)"

if [[ -z "$CONTRACT_ID" || "$CONTRACT_ID" != C* ]]; then
  echo "ERROR: failed to parse contract id from deploy output" >&2
  exit 1
fi

echo "$CONTRACT_ID" > "$OUT_FILE"
echo "==> Contract deployed: $CONTRACT_ID"
echo "==> Saved to $OUT_FILE"
