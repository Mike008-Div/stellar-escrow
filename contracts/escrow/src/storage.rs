use soroban_sdk::{contracttype, Env};

use crate::types::Escrow;

const TTL_THRESHOLD: u32 = 17_280 * 30;
const TTL_EXTEND_TO: u32 = 17_280 * 90;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Counter,
    Escrow(u64),
}

pub fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn next_id(env: &Env) -> u64 {
    let current: u64 = env
        .storage()
        .instance()
        .get(&DataKey::Counter)
        .unwrap_or(0);
    let next = current + 1;
    env.storage().instance().set(&DataKey::Counter, &next);
    next
}

pub fn store_escrow(env: &Env, escrow: &Escrow) {
    let key = DataKey::Escrow(escrow.id);
    env.storage().persistent().set(&key, escrow);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn load_escrow(env: &Env, id: u64) -> Option<Escrow> {
    let key = DataKey::Escrow(id);
    let result: Option<Escrow> = env.storage().persistent().get(&key);
    if result.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
    }
    result
}
