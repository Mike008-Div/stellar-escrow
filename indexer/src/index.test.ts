import { describe, it } from "node:test";
import assert from "node:assert";
import { EventProcessor, StellarEscrowIndexer } from "./index.ts";

describe("EventProcessor", () => {
  const processor = new EventProcessor();

  it("parses Escrow/Created event", () => {
    const raw = {
      id: "evt-1",
      contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      topic: ["Escrow", "Created"],
      value: [
        1,
        "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
        "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        "1000000",
      ],
      ledger: 12345,
      ledgerClosedAt: "2026-09-17T00:00:00Z",
      txHash: "0xhash1",
    };

    const parsed = processor.parseEvent(raw);
    assert.ok(parsed);
    assert.strictEqual(parsed.escrowId, 1n);
    assert.strictEqual(parsed.eventType, "Created");
    assert.strictEqual(parsed.payload.client, raw.value[1]);
    assert.strictEqual(parsed.payload.freelancer, raw.value[2]);
  });

  it("applies Created, Funded, and Released transitions correctly", () => {
    const createdEvent = {
      escrowId: 1n,
      eventType: "Created" as const,
      ledgerSequence: 100n,
      txHash: "0x1",
      payload: {
        client: "GCLIENT",
        freelancer: "GFREELANCER",
        amount: "1000",
      },
    };

    const state1 = processor.applyEvent(null, createdEvent);
    assert.strictEqual(state1.status, "Created");
    assert.strictEqual(state1.client, "GCLIENT");

    const fundedEvent = {
      escrowId: 1n,
      eventType: "Funded" as const,
      ledgerSequence: 101n,
      txHash: "0x2",
      payload: { amount: "1000" },
    };
    const state2 = processor.applyEvent(state1, fundedEvent);
    assert.strictEqual(state2.status, "Funded");

    const releasedEvent = {
      escrowId: 1n,
      eventType: "Released" as const,
      ledgerSequence: 102n,
      txHash: "0x3",
      payload: { freelancer: "GFREELANCER", amount: "1000" },
    };
    const state3 = processor.applyEvent(state2, releasedEvent);
    assert.strictEqual(state3.status, "Released");
  });

  it("applies ArbUpd and Disputed transitions", () => {
    const created = processor.applyEvent(null, {
      escrowId: 2n,
      eventType: "Created",
      ledgerSequence: 10n,
      txHash: "0xa",
      payload: { arbiter: "OLD_ARB" },
    });
    assert.strictEqual(created.arbiter, "OLD_ARB");

    const arbUpd = processor.applyEvent(created, {
      escrowId: 2n,
      eventType: "ArbUpd",
      ledgerSequence: 11n,
      txHash: "0xb",
      payload: { newArbiter: "NEW_ARB" },
    });
    assert.strictEqual(arbUpd.arbiter, "NEW_ARB");

    const disputed = processor.applyEvent(arbUpd, {
      escrowId: 2n,
      eventType: "Disputed",
      ledgerSequence: 12n,
      txHash: "0xc",
      payload: { raisedBy: "GCLIENT" },
    });
    assert.strictEqual(disputed.status, "Disputed");
  });
});

describe("StellarEscrowIndexer configuration", () => {
  it("initializes with configuration and environment defaults", () => {
    const indexer = new StellarEscrowIndexer({
      contractId: "CTEST123",
      pollIntervalMs: 2000,
    });
    const cfg = indexer.getConfig();
    assert.strictEqual(cfg.contractId, "CTEST123");
    assert.strictEqual(cfg.pollIntervalMs, 2000);
    assert.ok(cfg.databaseUrl);
  });
});
