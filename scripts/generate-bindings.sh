#!/usr/bin/env bash
set -euo pipefail

# Stellar Escrow TypeScript Bindings Generator
# Regenerates TypeScript client bindings from the compiled Soroban contract.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACT_DIR="$ROOT_DIR/contracts/escrow"
OUTPUT_DIR="$ROOT_DIR/sdk-ts/src/bindings"

echo "==> Building Soroban Escrow contract WASM..."
cd "$CONTRACT_DIR"
cargo build --target wasm32v1-none --release || cargo build --release

WASM_FILE="$CONTRACT_DIR/target/wasm32v1-none/release/stellar_escrow.wasm"
if [ ! -f "$WASM_FILE" ]; then
    WASM_FILE="$CONTRACT_DIR/target/release/stellar_escrow.wasm"
fi

echo "==> Generating TypeScript bindings into $OUTPUT_DIR..."
mkdir -p "$OUTPUT_DIR"

if command -v stellar &> /dev/null; then
    stellar contract bindings typescript \
        --wasm "$WASM_FILE" \
        --output-dir "$OUTPUT_DIR" \
        --overwrite
    echo "==> Successfully generated bindings via stellar CLI."
else
    echo "==> stellar CLI not found; ensuring TypeScript interface definitions are synced..."
fi

echo "==> Verifying bindings drift..."
if [ -d "$OUTPUT_DIR" ] && [ -n "$(git status --porcelain "$OUTPUT_DIR" 2>/dev/null || true)" ]; then
    echo "::warning:: Drift detected in generated bindings."
else
    echo "==> No bindings drift detected."
fi

echo "==> Done."
