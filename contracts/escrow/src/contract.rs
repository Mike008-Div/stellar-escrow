use soroban_sdk::{contract, contractimpl, token, Address, Env};

use crate::errors::EscrowError;
use crate::events;
use crate::storage::{self, bump_instance, load_escrow, next_id, store_escrow};
use crate::types::{Escrow, EscrowStatus};

#[contract]
pub struct StellarEscrowContract;

#[contractimpl]
impl StellarEscrowContract {
    /// Initialize the contract admin.
    pub fn init_admin(env: Env, admin: Address) -> Result<(), EscrowError> {
        bump_instance(&env);
        if storage::get_admin(&env).is_some() {
            return Err(EscrowError::AdminAlreadySet);
        }
        storage::set_admin(&env, &admin);
        Ok(())
    }

    /// Toggle contract paused state. Only admin can toggle.
    pub fn set_paused(env: Env, paused: bool) -> Result<(), EscrowError> {
        bump_instance(&env);
        let admin = storage::get_admin(&env).ok_or(EscrowError::NotAdmin)?;
        admin.require_auth();
        storage::set_paused(&env, paused);
        Ok(())
    }

    /// Check if contract is paused.
    pub fn is_paused(env: Env) -> bool {
        bump_instance(&env);
        storage::is_paused(&env)
    }

    /// Create a new escrow. `client` must authorize.
    pub fn create_escrow(
        env: Env,
        client: Address,
        freelancer: Address,
        arbiter: Address,
        token: Address,
        amount: i128,
        deadline: u64,
    ) -> Result<u64, EscrowError> {
        if storage::is_paused(&env) {
            return Err(EscrowError::Paused);
        }
        client.require_auth();
        bump_instance(&env);

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if deadline <= env.ledger().timestamp() {
            return Err(EscrowError::InvalidDeadline);
        }

        let id = next_id(&env);
        let escrow = Escrow {
            id,
            client: client.clone(),
            freelancer: freelancer.clone(),
            arbiter,
            token,
            amount,
            deadline,
            status: EscrowStatus::Created,
            created_at: env.ledger().timestamp(),
        };
        store_escrow(&env, &escrow);

        events::emit_created(&env, id, &client, &freelancer, amount);
        Ok(id)
    }

    /// Client funds the escrow — moves tokens from client into the contract.
    pub fn fund_escrow(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        if storage::is_paused(&env) {
            return Err(EscrowError::Paused);
        }
        bump_instance(&env);

        let mut escrow = load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;
        if escrow.status != EscrowStatus::Created {
            return Err(EscrowError::InvalidStatus);
        }
        escrow.client.require_auth();

        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&escrow.client, &contract_address, &escrow.amount);

        escrow.status = EscrowStatus::Funded;
        store_escrow(&env, &escrow);

        events::emit_funded(&env, escrow_id, escrow.amount);
        Ok(())
    }

    /// Client releases funds to the freelancer.
    pub fn release(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        bump_instance(&env);

        let mut escrow = load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }
        escrow.client.require_auth();

        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&contract_address, &escrow.freelancer, &escrow.amount);

        escrow.status = EscrowStatus::Released;
        store_escrow(&env, &escrow);

        events::emit_released(&env, escrow_id, &escrow.freelancer, escrow.amount);
        Ok(())
    }

    /// Client refunds themselves after the deadline, if not released.
    pub fn refund(env: Env, escrow_id: u64) -> Result<(), EscrowError> {
        bump_instance(&env);

        let mut escrow = load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }
        if env.ledger().timestamp() <= escrow.deadline {
            return Err(EscrowError::DeadlineNotPassed);
        }
        escrow.client.require_auth();

        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&contract_address, &escrow.client, &escrow.amount);

        escrow.status = EscrowStatus::Refunded;
        store_escrow(&env, &escrow);

        events::emit_refunded(&env, escrow_id, &escrow.client, escrow.amount);
        Ok(())
    }

    /// Either party raises a dispute — arbiter will resolve.
    pub fn raise_dispute(env: Env, escrow_id: u64, raised_by: Address) -> Result<(), EscrowError> {
        bump_instance(&env);

        let mut escrow = load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;
        if escrow.status != EscrowStatus::Funded {
            return Err(EscrowError::InvalidStatus);
        }
        raised_by.require_auth();
        if raised_by != escrow.client && raised_by != escrow.freelancer {
            return Err(EscrowError::InvalidStatus);
        }

        escrow.status = EscrowStatus::Disputed;
        store_escrow(&env, &escrow);

        events::emit_disputed(&env, escrow_id, &raised_by);
        Ok(())
    }

    /// Arbiter resolves a dispute by choosing a winner.
    pub fn resolve_dispute(env: Env, escrow_id: u64, winner: Address) -> Result<(), EscrowError> {
        bump_instance(&env);

        let mut escrow = load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)?;
        if escrow.status != EscrowStatus::Disputed {
            return Err(EscrowError::InvalidStatus);
        }
        escrow.arbiter.require_auth();
        if winner != escrow.client && winner != escrow.freelancer {
            return Err(EscrowError::InvalidStatus);
        }

        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&contract_address, &winner, &escrow.amount);

        escrow.status = EscrowStatus::Resolved;
        store_escrow(&env, &escrow);

        events::emit_resolved(&env, escrow_id, &winner, escrow.amount);
        Ok(())
    }

    /// Read-only getter.
    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<Escrow, EscrowError> {
        bump_instance(&env);
        load_escrow(&env, escrow_id).ok_or(EscrowError::EscrowNotFound)
    }
}
