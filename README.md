# Stellar Escrow

A Soroban escrow protocol for freelance and cross-border payments on Stellar.

Clients lock funds, freelancers deliver, arbiters resolve disputes — all on-chain.

## Why this exists

Freelance and cross-border payments still rely on middlemen who take 5–15% and hold funds for days. This protocol replaces the middleman with a Soroban contract: funds are locked in escrow, released on delivery, and disputes are resolved by a mutually agreed arbiter. No custodian. No wire delays. Auditable on-chain.

## What's in this repo

- `contracts/escrow/` — the Soroban escrow contract (Rust)
- `sdk-ts/` — TypeScript SDK for frontend / backend integrators
- `frontend/` — Next.js demo dashboard (client, freelancer, arbiter views)
- `indexer/` — event indexer that watches escrow events into Postgres
- `docs/` — architecture, access control, storage, error codes
- `scripts/` — deploy and verify scripts

## Status

Early. The contract is the priority; SDK, frontend, and indexer follow.

## Build

```bash
cd contracts/escrow
cargo test
cargo build --target wasm32v1-none --release
```

## Deploy

cp deploy-testnet.env.example deploy-testnet.env
# edit deploy-testnet.env
source deploy-testnet.env && ./scripts/deploy-testnet.sh

## License
MIT License

Copyright (c) 2026 Stellar Escrow contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.