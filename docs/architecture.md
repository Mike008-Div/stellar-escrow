# Architecture

## Repository Structure

- `contracts/escrow/` — Soroban contract (Rust)
- `sdk-ts/` — TypeScript SDK for frontend/backend integrators
- `frontend/` — Next.js dashboard (client, freelancer, arbiter views)
- `indexer/` — Event indexer into Postgres
- `scripts/` — Deploy and verify scripts
- `docs/` — Documentation and specifications

## Contract Module Layout

- `lib.rs` — Crate root and module exports
- `contract.rs` — `#[contractimpl]` entry points and business logic
- `types.rs` — Escrow struct, EscrowStatus enum, and data types
- `storage.rs` — DataKey definitions, TTL management, and all storage operations
- `events.rs` — Event definitions and emission functions
- `errors.rs` — EscrowError enum and error handling
- `test/` — Unit and integration tests

## Data Flow

1. **Client Call** → `contract.rs` (authentication, validation)
2. **Validation** → `storage.rs` (load/mutate state)
3. **Token Operations** → `token::Client` (Stellar Asset Contract transfers)
4. **Event Emission** → `events.rs` (emit relevant events)
5. **State Persistence** → `storage.rs` (save updated state)

## Component Interactions

- **Frontend** ↔ **TypeScript SDK** ↔ **Soroban Contract**
- **Indexer** ← **Contract Events** → **Postgres Database**
- **Deployment Scripts** → **Stellar Testnet/Mainnet**

## Technology Stack

- **Smart Contracts**: Rust with Soroban SDK
- **Frontend**: Next.js (TypeScript, React)
- **SDK**: TypeScript with Soroban Client
- **Indexer**: Node.js with Postgres
- **CI/CD**: GitHub Actions
