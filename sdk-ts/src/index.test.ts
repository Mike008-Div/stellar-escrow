import { describe, it } from "node:test";
import assert from "node:assert";
import { StellarEscrowClient, EscrowStatus } from "./index.ts";

describe("StellarEscrowClient", () => {
  const contractId = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
  const client = new StellarEscrowClient({ contractId });

  it("initializes with valid contract ID and default network", () => {
    assert.strictEqual(client.contractId, contractId);
    assert.strictEqual(client.rpcUrl, "https://soroban-testnet.stellar.org");
  });

  it("throws error if contractId is missing or empty", () => {
    assert.throws(() => new StellarEscrowClient({ contractId: "" }), /Invalid contractId/);
  });

  describe("createEscrow validation and transaction building", () => {
    const validParams = {
      client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
      token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      amount: 1000n,
      deadline: Math.floor(Date.now() / 1000) + 86400,
    };

    it("builds valid create_escrow transaction payload", async () => {
      const tx = await client.buildCreateEscrowTx(validParams);
      assert.strictEqual(tx.contractId, contractId);
      assert.strictEqual(tx.method, "create_escrow");
      assert.strictEqual(tx.args[0], validParams.client);
      assert.strictEqual(tx.args[1], validParams.freelancer);
      assert.strictEqual(tx.args[4], "1000");
    });

    it("rejects zero or negative amounts", () => {
      assert.throws(
        () => client.validateCreateEscrowParams({ ...validParams, amount: 0 }),
        /Invalid amount/
      );
      assert.throws(
        () => client.validateCreateEscrowParams({ ...validParams, amount: -50 }),
        /Invalid amount/
      );
    });

    it("rejects past deadlines", () => {
      assert.throws(
        () => client.validateCreateEscrowParams({ ...validParams, deadline: 1000 }),
        /Invalid deadline/
      );
    });

    it("executes createEscrow with signer", async () => {
      const mockSigner = async (payload: any) => ({
        hash: "0x123abc",
        escrowId: 1n,
        payload,
      });

      const res = await client.createEscrow(validParams, mockSigner);
      assert.strictEqual(res.status, "SUCCESS");
      assert.strictEqual(res.txHash, "0x123abc");
      assert.strictEqual(res.escrowId, 1n);
    });
  });

  describe("fundEscrow validation and transaction building", () => {
    const validFundParams = {
      escrowId: 1n,
      client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    };

    it("builds valid fund_escrow transaction payload", async () => {
      const tx = await client.buildFundEscrowTx(validFundParams);
      assert.strictEqual(tx.contractId, contractId);
      assert.strictEqual(tx.method, "fund_escrow");
      assert.deepStrictEqual(tx.args, ["1"]);
    });

    it("rejects non-positive escrowId", () => {
      assert.throws(
        () => client.validateFundEscrowParams({ ...validFundParams, escrowId: 0 }),
        /Invalid escrowId/
      );
    });

    it("executes fundEscrow with signer", async () => {
      const mockSigner = async (payload: any) => ({
        hash: "0xfund123",
        payload,
      });

      const res = await client.fundEscrow(validFundParams, mockSigner);
      assert.strictEqual(res.status, "SUCCESS");
      assert.strictEqual(res.txHash, "0xfund123");
      assert.strictEqual(res.escrowId, 1n);
    });
  });

  describe("getEscrow lookup by identifier", () => {
    it("returns escrow record for valid identifier", async () => {
      const escrow = await client.getEscrow(1n);
      assert.ok(escrow);
      assert.strictEqual(escrow?.id, 1n);
      assert.strictEqual(escrow?.status, "Created");
    });

    it("rejects non-positive escrow identifier", async () => {
      await assert.rejects(async () => client.getEscrow(0), /Invalid escrowId/);
    });
  });
});
