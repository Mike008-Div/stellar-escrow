use soroban_sdk::{
    testutils::Address as _, token, Address, Env,
};

use crate::contract::{StellarEscrowContract, StellarEscrowContractClient};

pub const NOW: u64 = 1_700_000_000;
pub const FUTURE_DEADLINE: u64 = NOW + 86_400;

pub struct Ctx<'a> {
    pub env: Env,
    pub client: StellarEscrowContractClient<'a>,
    pub token: Address,
    pub token_admin: token::StellarAssetClient<'a>,
    pub client_addr: Address,
    pub freelancer: Address,
    pub arbiter: Address,
}

pub fn setup<'a>() -> Ctx<'a> {
    let env = Env::default();
    env.mock_all_auths();
    use soroban_sdk::testutils::Ledger as _;
    env.ledger().set_timestamp(NOW);

    let contract_id = env.register(StellarEscrowContract, ());
    let client = StellarEscrowContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token = sac.address();
    let token_admin = token::StellarAssetClient::new(&env, &token);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbiter = Address::generate(&env);

    token_admin.mint(&client_addr, &10_000);

    Ctx {
        env,
        client,
        token,
        token_admin,
        client_addr,
        freelancer,
        arbiter,
    }
}
