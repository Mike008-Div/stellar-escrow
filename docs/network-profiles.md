# SDK Network Configuration Profiles

The Stellar Escrow TypeScript SDK provides named network profiles for local standalone networks, SDF Testnet, and Stellar Mainnet.

## Available Named Profiles

| Profile Name | RPC URL | Network Passphrase | Horizon Endpoint |
| :--- | :--- | :--- | :--- |
| **`local`** | `http://localhost:8000/soroban/rpc` | `Standalone Network ; February 2017` | `http://localhost:8000` |
| **`testnet`** | `https://soroban-testnet.stellar.org` | `Test SDF Network ; September 2015` | `https://horizon-testnet.stellar.org` |
| **`mainnet`** | `https://mainnet.sorobanrpc.com` | `Public Global Stellar Network ; July 2015` | `https://horizon.stellar.org` |

---

## Usage Examples

### 1. Using Default (Testnet)

```typescript
import { StellarEscrowClient } from "@stellar-escrow/sdk";

const client = new StellarEscrowClient({
  contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
});
```

### 2. Using Named Profile

```typescript
// Local development
const localClient = new StellarEscrowClient({
  contractId: "CDLZ...",
  network: "local",
});

// Production Mainnet
const mainnetClient = new StellarEscrowClient({
  contractId: "CDLZ...",
  network: "mainnet",
});
```

### 3. Custom Network with Overrides

```typescript
const customClient = new StellarEscrowClient({
  contractId: "CDLZ...",
  network: {
    name: "testnet",
    rpcUrl: "https://custom-soroban-rpc.example.com",
  },
});
```
