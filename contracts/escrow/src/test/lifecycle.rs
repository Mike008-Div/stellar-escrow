use soroban_sdk::{testutils::Address as _, token};

use crate::errors::EscrowError;
use crate::types::EscrowStatus;

use super::common::*;

#[test]
fn create_fund_release_happy_path() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    assert_eq!(id, 1);

    ctx.client.fund_escrow(&id);

    let token_client = token::Client::new(&ctx.env, &ctx.token);
    assert_eq!(token_client.balance(&ctx.freelancer), 0);

    ctx.client.release(&id);

    assert_eq!(token_client.balance(&ctx.freelancer), 1_000);

    let escrow = ctx.client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Released);
}

#[test]
fn create_rejects_zero_amount() {
    let ctx = setup();
    let err = ctx
        .client
        .try_create_escrow(
            &ctx.client_addr,
            &ctx.freelancer,
            &ctx.arbiter,
            &ctx.token,
            &0,
            &FUTURE_DEADLINE,
        )
        .unwrap_err();
    assert_eq!(err, Ok(EscrowError::InvalidAmount));
}

#[test]
fn fund_unknown_returns_not_found() {
    let ctx = setup();
    let err = ctx.client.try_fund_escrow(&999).unwrap_err();
    assert_eq!(err, Ok(EscrowError::EscrowNotFound));
}

#[test]
fn dispute_then_arbiter_resolves_for_freelancer() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    ctx.client.fund_escrow(&id);
    ctx.client.raise_dispute(&id, &ctx.client_addr);
    ctx.client.resolve_dispute(&id, &ctx.freelancer);

    let token_client = token::Client::new(&ctx.env, &ctx.token);
    assert_eq!(token_client.balance(&ctx.freelancer), 1_000);

    let escrow = ctx.client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Resolved);
}

#[test]
fn refund_before_deadline_fails() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    ctx.client.fund_escrow(&id);

    let err = ctx.client.try_refund(&id).unwrap_err();
    assert_eq!(err, Ok(EscrowError::DeadlineNotPassed));
}

#[test]
fn pause_blocks_actions_and_unpause_resumes() {
    let ctx = setup();
    let admin = soroban_sdk::Address::generate(&ctx.env);

    // Initial state: not paused
    assert!(!ctx.client.is_paused());

    // Initialize admin
    ctx.client.init_admin(&admin);

    // Pause contract
    ctx.client.set_paused(&true);
    assert!(ctx.client.is_paused());

    // Creating escrow when paused fails with Paused error
    let err = ctx
        .client
        .try_create_escrow(
            &ctx.client_addr,
            &ctx.freelancer,
            &ctx.arbiter,
            &ctx.token,
            &1_000,
            &FUTURE_DEADLINE,
        )
        .unwrap_err();
    assert_eq!(err, Ok(EscrowError::Paused));

    // Unpause contract
    ctx.client.set_paused(&false);
    assert!(!ctx.client.is_paused());

    // Now creation succeeds
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    assert_eq!(id, 1);
}

#[test]
fn non_admin_cannot_set_pause() {
    let ctx = setup();
    // Setting pause without initializing admin returns NotAdmin
    let err = ctx.client.try_set_paused(&true).unwrap_err();
    assert_eq!(err, Ok(EscrowError::NotAdmin));
}

#[test]
fn cancel_unfunded_escrow_succeeds_and_updates_status() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    let escrow = ctx.client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Created);

    ctx.client.cancel_escrow(&id);

    let cancelled_escrow = ctx.client.get_escrow(&id);
    assert_eq!(cancelled_escrow.status, EscrowStatus::Cancelled);
}

#[test]
fn cancel_funded_escrow_fails() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    ctx.client.fund_escrow(&id);

    let err = ctx.client.try_cancel_escrow(&id).unwrap_err();
    assert_eq!(err, Ok(EscrowError::InvalidStatus));
}

#[test]
fn get_escrow_count_tracks_created_escrows() {
    let ctx = setup();
    assert_eq!(ctx.client.get_escrow_count(), 0);

    let id1 = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    assert_eq!(id1, 1);
    assert_eq!(ctx.client.get_escrow_count(), 1);

    let id2 = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &2_000,
        &FUTURE_DEADLINE,
    );
    assert_eq!(id2, 2);
    assert_eq!(ctx.client.get_escrow_count(), 2);
}

#[test]
fn partial_release_happy_path() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    ctx.client.fund_escrow(&id);

    let token_client = token::Client::new(&ctx.env, &ctx.token);
    let initial_client_balance = token_client.balance(&ctx.client_addr);

    // Split: 700 to freelancer, 300 refunded to client
    ctx.client.partial_release(&id, &700, &300);

    assert_eq!(token_client.balance(&ctx.freelancer), 700);
    assert_eq!(token_client.balance(&ctx.client_addr), initial_client_balance + 300);

    let escrow = ctx.client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Released);
}

#[test]
fn partial_release_invalid_split_fails() {
    let ctx = setup();
    let id = ctx.client.create_escrow(
        &ctx.client_addr,
        &ctx.freelancer,
        &ctx.arbiter,
        &ctx.token,
        &1_000,
        &FUTURE_DEADLINE,
    );
    ctx.client.fund_escrow(&id);

    // Split sum 600 + 300 = 900 != 1000
    let err = ctx.client.try_partial_release(&id, &600, &300).unwrap_err();
    assert_eq!(err, Ok(EscrowError::InvalidAmount));
}
