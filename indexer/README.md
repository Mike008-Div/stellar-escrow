# @stellar-escrow/indexer

Postgres-backed event indexer for the Stellar Escrow Soroban smart contract.

## Overview

The indexer streams on-chain contract events (`Escrow/Created`, `Escrow/Funded`, `Escrow/Released`, `Escrow/PartRel`, `Escrow/Refunded`, `Escrow/Disputed`, `Escrow/Resolved`, `Escrow/Cancelled`, `Escrow/ArbUpd`), validates and parses them idempotently, and persists structured records into PostgreSQL.

## Architecture

- **`migrations/001_init.sql`**: Schema definition creating `escrows`, `escrow_events`, and `indexed_ledgers` tables.
- **`src/processor.ts`**: Idempotent state machine that computes updated escrow records from raw Soroban events.
- **`src/index.ts`**: Ingestion worker loop connecting to Soroban RPC and database.

## Local Setup

### 1. Start Postgres

```bash
docker run -d --name stellar-escrow-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stellar_escrow \
  -p 5432:5432 postgres:16-alpine
```

### 2. Run Database Migrations

```bash
psql -h localhost -U postgres -d stellar_escrow -f migrations/001_init.sql
```

### 3. Environment Variables

Create `.env` or export environment variables:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/stellar_escrow"
SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
ESCROW_CONTRACT_ID="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
POLL_INTERVAL_MS=5000
```

### 4. Run Indexer and Tests

```bash
npm test
npm start
```
