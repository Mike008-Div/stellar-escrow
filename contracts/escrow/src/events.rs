use soroban_sdk::{symbol_short, Address, Env};

pub fn emit_created(env: &Env, id: u64, client: &Address, freelancer: &Address, amount: i128) {
    env.events().publish(
        (symbol_short!("Escrow"), symbol_short!("Created")),
        (id, client, freelancer, amount),
    );
}

pub fn emit_funded(env: &Env, id: u64, amount: i128) {
    env.events()
        .publish((symbol_short!("Escrow"), symbol_short!("Funded")), (id, amount));
}

pub fn emit_released(env: &Env, id: u64, freelancer: &Address, amount: i128) {
    env.events().publish(
        (symbol_short!("Escrow"), symbol_short!("Released")),
        (id, freelancer, amount),
    );
}

pub fn emit_refunded(env: &Env, id: u64, client: &Address, amount: i128) {
    env.events().publish(
        (symbol_short!("Escrow"), symbol_short!("Refunded")),
        (id, client, amount),
    );
}

pub fn emit_disputed(env: &Env, id: u64, raised_by: &Address) {
    env.events()
        .publish((symbol_short!("Escrow"), symbol_short!("Disputed")), (id, raised_by));
}

pub fn emit_resolved(env: &Env, id: u64, winner: &Address, amount: i128) {
    env.events().publish(
        (symbol_short!("Escrow"), symbol_short!("Resolved")),
        (id, winner, amount),
    );
}

pub fn emit_cancelled(env: &Env, id: u64, client: &Address) {
    env.events()
        .publish((symbol_short!("Escrow"), symbol_short!("Cancelled")), (id, client));
}

pub fn emit_partial_released(env: &Env, id: u64, freelancer_amount: i128, client_amount: i128) {
    env.events().publish(
        (symbol_short!("Escrow"), symbol_short!("PartRel")),
        (id, freelancer_amount, client_amount),
    );
}
