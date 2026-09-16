# Architecture
contracts/escrow/ Soroban contract (Rust)
sdk-ts/ TypeScript SDK for integrators
frontend/ Next.js dashboard (client, freelancer, arbiter)
indexer/ Event indexer into Postgres
scripts/ Deploy + verify scripts

text

## Contract module layout

- `lib.rs` — crate root
- `contract.rs` — #[contractimpl] entry points
- `types.rs` — Escrow struct, EscrowStatus enum
- `storage.rs` — DataKey, TTL, all storage reads/writes
- `events.rs` — one emit_* per event
- `errors.rs` — EscrowError enum

## Data flow
Client call → contract.rs (auth, validate) → storage.rs (load/mutate) → token::Client (SAC transfer) → events.rs

text
EOF
