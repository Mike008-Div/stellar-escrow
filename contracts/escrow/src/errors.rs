use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    EscrowNotFound = 1,
    InvalidAmount = 2,
    InvalidDeadline = 3,
    InvalidStatus = 4,
    DeadlineNotPassed = 5,
}
