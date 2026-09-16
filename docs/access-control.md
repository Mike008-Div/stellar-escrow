# Access Control

| Function | Authorized party |
|---|---|
| create_escrow | client |
| fund_escrow | client |
| release | client |
| refund | client |
| raise_dispute | client or freelancer |
| resolve_dispute | arbiter |
| get_escrow | none (read-only) |

Every mutating call begins with `require_auth()` on the relevant address.
Role checks against stored state happen after auth.
