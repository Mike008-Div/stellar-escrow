# Contract and SDK Types

This document provides a comprehensive reference for the core data types used in the Stellar Escrow smart contract and client SDKs.

---

## 1. The `Escrow` Struct

The `Escrow` struct represents the persistent state of an individual escrow agreement stored on the Stellar blockchain (Soroban ledger).

### Rust Definition

```rust
#[contracttype]
#[derive(Clone, Debug)]
pub struct Escrow {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub arbiter: Address,
    pub token: Address,
    pub amount: i128,
    pub deadline: u64,
    pub status: EscrowStatus,
    pub created_at: u64,
}
```

### TypeScript SDK Representation

```typescript
export interface Escrow {
  id: bigint;
  client: string;
  freelancer: string;
  arbiter: string;
  token: string;
  amount: bigint;
  deadline: bigint;
  status: EscrowStatus;
  createdAt: bigint;
}
```

### Field Breakdown

| Field | Rust Type | TS Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | `u64` | `bigint` | Unique, monotonically increasing numeric identifier assigned by the contract counter on creation. |
| `client` | `Address` | `string` | Stellar account or contract address of the buyer/funder who creates and funds the escrow. |
| `freelancer` | `Address` | `string` | Stellar account or contract address of the payee/service provider who performs work. |
| `arbiter` | `Address` | `string` | Neutral third-party address authorized to resolve disputes if disagreements occur. Can be updated before funding. |
| `token` | `Address` | `string` | Stellar Asset Contract (SAC) or custom token address used for holding and settling the escrowed funds. |
| `amount` | `i128` | `bigint` | Total value locked in the escrow denominated in token base units (stroops/smallest unit). Must be strictly > 0. |
| `deadline` | `u64` | `bigint` | Unix timestamp (in seconds) after which auto-refund becomes available if funds remain unreleased. |
| `status` | `EscrowStatus` | `EscrowStatus` | Current lifecycle state of the escrow agreement. |
| `created_at` | `u64` | `bigint` | Unix timestamp (in seconds) recorded from ledger time when the escrow record was initialized. |

---

## 2. The `EscrowStatus` Enum

The `EscrowStatus` enum defines every valid state an escrow can occupy during its lifecycle.

```rust
#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Released,
    Refunded,
    Disputed,
    Resolved,
    Cancelled,
}
```

### Status Descriptions

- **`Created`** (Initial): The escrow record has been created by the client on-chain, but no funds have been deposited yet. The client may cancel the agreement or update the arbiter in this state.
- **`Funded`**: The client transferred the specified `amount` of `token` into the contract. The freelancer can now proceed with confidence that funds are locked.
- **`Released`** (Terminal): The client released funds to the freelancer (either fully or via an agreed partial split).
- **`Refunded`** (Terminal): The escrow deadline elapsed without release or dispute, and funds were refunded back to the client.
- **`Disputed`**: Either the client or the freelancer opened a dispute. Funds remain locked in contract custody until the arbiter acts.
- **`Resolved`** (Terminal): The designated `arbiter` reviewed the dispute and awarded the locked funds to either the client or freelancer.
- **`Cancelled`** (Terminal): The client cancelled the agreement prior to funding. No tokens were transferred.

---

## 3. Lifecycle Status Transitions

```
                 +-----------+
                 |  Created  |
                 +-----+-----+
                       |
         +-------------+-------------+
         |                           |
   [cancel_escrow]             [fund_escrow]
         |                           |
         v                           v
  +--------------+            +------------+
  |  Cancelled   |            |   Funded   |
  |  (Terminal)  |            +---+----+---+
  +--------------+                |    |   |
                                  |    |   +--------------------+
             +--------------------+    |                        |
             |                         |                        |
         [release]                 [refund]              [raise_dispute]
             |                 (deadline passed)                |
             v                         |                        v
      +--------------+                 v                 +--------------+
      |   Released   |          +--------------+         |   Disputed   |
      |  (Terminal)  |          |   Refunded   |         +-------+------+
      +--------------+          |  (Terminal)  |                 |
                                +--------------+         [resolve_dispute]
                                                                 |
                                                                 v
                                                          +--------------+
                                                          |   Resolved   |
                                                          |  (Terminal)  |
                                                          +--------------+
```

---

## 4. Public Contract Method Identifiers

| Method | Parameters | Caller Auth | State Transition |
| :--- | :--- | :--- | :--- |
| `create_escrow` | `client, freelancer, arbiter, token, amount, deadline` | `client` | `None -> Created` |
| `fund_escrow` | `escrow_id` | `client` | `Created -> Funded` |
| `cancel_escrow`| `escrow_id` | `client` | `Created -> Cancelled` |
| `update_arbiter`| `escrow_id, new_arbiter` | `client` | `Created -> Created` |
| `release` | `escrow_id` | `client` | `Funded -> Released` |
| `partial_release` | `escrow_id, freelancer_amount, client_amount` | `client` | `Funded -> Released` |
| `refund` | `escrow_id` | Any caller (after deadline) | `Funded -> Refunded` |
| `raise_dispute`| `escrow_id, raised_by` | `client` or `freelancer` | `Funded -> Disputed` |
| `resolve_dispute`| `escrow_id, winner` | `arbiter` | `Disputed -> Resolved` |
| `get_escrow` | `escrow_id` | Read-only | None |
| `get_escrow_count`| None | Read-only | None |
| `set_paused` | `paused` | `admin` | None |
| `is_paused` | None | Read-only | None |
