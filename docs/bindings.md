# TypeScript Contract Bindings

This document describes how to generate and verify TypeScript bindings for the Stellar Escrow Soroban contract.

## Overview

Stellar Escrow uses Soroban's native interface metadata to produce fully typed TypeScript client bindings. This ensures full type-safety between contract state and client applications.

## Prerequisites

- Rust and Cargo (`stable` with `wasm32v1-none` target)
- Stellar CLI:
  ```bash
  cargo install --locked stellar-cli --features opt
  ```

## Generating Bindings Locally

Run the build & binding generator script from the repository root:

```bash
chmod +x scripts/generate-bindings.sh
./scripts/generate-bindings.sh
```

Or manually:

```bash
# 1. Build the contract WASM
cd contracts/escrow
cargo build --target wasm32v1-none --release

# 2. Generate TypeScript bindings
stellar contract bindings typescript \
  --wasm target/wasm32v1-none/release/stellar_escrow.wasm \
  --output-dir ../../sdk-ts/src/bindings \
  --overwrite
```

## CI Verification

The CI workflow (`.github/workflows/ci.yml`) runs the `bindings` job on every pull request to ensure that contract changes do not introduce uncommitted interface drift in client SDKs.
