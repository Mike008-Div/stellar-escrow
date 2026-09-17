use soroban_sdk::token;
use soroban_sdk::testutils::Ledger as _;

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
fn create_rejects_past_deadline() {
    let ctx = setup();
    let err = ctx
        .client
        .try_create_escrow(
            &ctx.client_addr,
            &ctx.freelancer,
            &ctx.arbiter,
            &ctx.token,
            &1_000,
            &NOW,
        )
        .unwrap_err();
    assert_eq!(err, Ok(EscrowError::InvalidDeadline));
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
fn refund_after_deadline_returns_funds() {
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
    ctx.env.ledger().set_timestamp(FUTURE_DEADLINE + 1);

    ctx.client.refund(&id);

    let token_client = token::Client::new(&ctx.env, &ctx.token);
    assert_eq!(token_client.balance(&ctx.client_addr), 10_000);
    assert_eq!(ctx.client.get_escrow(&id).status, EscrowStatus::Refunded);
}
