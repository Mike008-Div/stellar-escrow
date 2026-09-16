use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Released,
    Refunded,
    Disputed,
    Resolved,
}

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
