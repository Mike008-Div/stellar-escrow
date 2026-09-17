# Testnet Integration Testing

This document explains how the end-to-end Stellar Testnet integration pipeline works and how to execute test deployments.

## Overview

The integration suite (`scripts/integration-test.sh` & `.github/workflows/integration.yml`) deploys the latest compiled Soroban WASM to the Stellar testnet, exercises an escrow lifecycle flow (create, fund, verify count), and validates network execution.

## Credentials & Security

- Signing credentials and secret keys are **never stored in source control**.
- In CI, credentials are provided via GitHub Actions repository secrets:
  - `STELLAR_TESTNET_SECRET`: Secret key for funding and contract deployment.
  - `STELLAR_TESTNET_ACCOUNT`: Account address or configured identity alias.

## Manual Triggering in CI

The workflow is intentionally configured with `workflow_dispatch` so it can be run on demand without slowing down regular pull request reviews:

1. Navigate to the **Actions** tab on GitHub.
2. Select **Testnet Integration Test**.
3. Click **Run workflow** and choose the target branch and network.

## Running Locally

```bash
export STELLAR_SECRET_KEY="S..."
export STELLAR_SOURCE="my-testnet-account"
export STELLAR_NETWORK="testnet"

chmod +x scripts/integration-test.sh
./scripts/integration-test.sh
```
