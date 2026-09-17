import { describe, it } from "node:test";
import assert from "node:assert";
import { getStatusBadgeStyle, truncateAddress } from "./helpers.ts";

describe("Freelancer Dashboard UI Helpers", () => {
  it("truncates Stellar addresses correctly", () => {
    const full = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    const truncated = truncateAddress(full);
    assert.strictEqual(truncated, "GBBD47...LLFLA5");
  });

  it("handles short or empty address gracefully", () => {
    assert.strictEqual(truncateAddress(""), "");
    assert.strictEqual(truncateAddress("SHORT"), "SHORT");
  });

  it("returns distinct badge styles for each EscrowStatus", () => {
    const funded = getStatusBadgeStyle("Funded");
    assert.ok(funded.backgroundColor);
    assert.ok(funded.color);

    const released = getStatusBadgeStyle("Released");
    assert.notStrictEqual(funded.color, released.color);

    const disputed = getStatusBadgeStyle("Disputed");
    assert.notStrictEqual(disputed.color, released.color);
  });
});
