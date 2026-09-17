#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# scripts/verify-build.sh
#
# Single repeatable verification script for the entire repository.
# Verifies smart contracts, TypeScript SDK, indexer, and frontend packages.
#
# Prerequisites:
#   - Rust toolchain (cargo, rustc >= 1.77)
#   - Node.js (>= 20, recommended 22)
#   - npm
#
# Usage:
#   ./scripts/verify-build.sh
#   (Can be run from any working directory)
# ==============================================================================

# Resolve repository root regardless of where the script is called from
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure cargo is accessible if in standard locations
if ! command -v cargo &> /dev/null && [ -d "$HOME/.cargo/bin" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

echo "=================================================="
echo " Starting Full Repository Build & Test Verification"
echo " Repository root: $ROOT_DIR"
echo "=================================================="

# 1. Smart Contract Verification
echo ""
echo "==> [1/4] Verifying Soroban Smart Contract..."
cd "$ROOT_DIR/contracts/escrow"
echo " -> Checking format..."
cargo fmt --all -- --check
echo " -> Running clippy..."
cargo clippy --all-targets -- -D warnings
echo " -> Running contract unit tests..."
cargo test --quiet

# 2. TypeScript SDK Verification
echo ""
echo "==> [2/4] Verifying TypeScript SDK (@stellar-escrow/sdk)..."
cd "$ROOT_DIR/sdk-ts"
echo " -> Running SDK tests..."
npm test

# 3. Indexer Verification
echo ""
echo "==> [3/4] Verifying Indexer (@stellar-escrow/indexer)..."
cd "$ROOT_DIR/indexer"
echo " -> Running indexer tests..."
npm test

# 4. Frontend Verification
echo ""
echo "==> [4/4] Verifying Frontend Application..."
cd "$ROOT_DIR/frontend"
echo " -> Running frontend tests..."
npm test

echo ""
echo "=================================================="
echo " ✓ All builds, tests, and formatting checks PASSED!"
echo "=================================================="
