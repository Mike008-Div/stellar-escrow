# @stellar-escrow/sdk

TypeScript SDK for interacting with the Stellar Escrow Soroban smart contract.

## Installation

```bash
npm install @stellar-escrow/sdk
```

## Quick Start

```typescript
import { StellarEscrowClient } from "@stellar-escrow/sdk";

const client = new StellarEscrowClient({
  contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  rpcUrl: "https://soroban-testnet.stellar.org",
});

// 1. Create an escrow
const createResult = await client.createEscrow({
  client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
  token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  amount: 10000000n, // stroops
  deadline: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
});

// 2. Fund the escrow
const fundResult = await client.fundEscrow({
  escrowId: createResult.escrowId!,
  client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
});
```

## Running Tests

```bash
npm test
```
