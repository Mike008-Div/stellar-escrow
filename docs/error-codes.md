# Error Codes

| Variant | Code | Meaning |
|---|---:|---|
| EscrowNotFound | 1 | The requested escrow ID is not stored. |
| InvalidAmount | 2 | The escrow amount must be greater than zero. |
| InvalidDeadline | 3 | The deadline must be later than the current ledger timestamp. |
| InvalidStatus | 4 | The requested operation is not valid for the escrow state or caller. |
| DeadlineNotPassed | 5 | A refund was requested before the deadline elapsed. |
