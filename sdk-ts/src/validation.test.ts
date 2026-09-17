import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ValidationError,
  validateAddress,
  validateAmount,
  validateEscrowId,
  validateDeadline,
  validateSplit,
} from "./validation.ts";

describe("SDK Input Validation Helpers", () => {
  describe("validateAddress", () => {
    it("accepts valid G-address and C-address", () => {
      const gAddr = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
      const cAddr = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
      assert.strictEqual(validateAddress(gAddr), gAddr);
      assert.strictEqual(validateAddress(cAddr), cAddr);
    });

    it("rejects invalid or malformed addresses", () => {
      assert.throws(() => validateAddress(""), ValidationError);
      assert.throws(() => validateAddress("invalid-addr"), ValidationError);
      assert.throws(() => validateAddress("XBB..."), ValidationError);
    });
  });

  describe("validateAmount", () => {
    it("accepts positive integer and string amounts", () => {
      assert.strictEqual(validateAmount(100), 100n);
      assert.strictEqual(validateAmount("5000000"), 5000000n);
      assert.strictEqual(validateAmount(1000n), 1000n);
    });

    it("rejects zero, negative, or invalid amounts", () => {
      assert.throws(() => validateAmount(0), ValidationError);
      assert.throws(() => validateAmount(-50), ValidationError);
      assert.throws(() => validateAmount("abc"), ValidationError);
    });
  });

  describe("validateEscrowId", () => {
    it("accepts valid positive IDs", () => {
      assert.strictEqual(validateEscrowId(1), 1n);
      assert.strictEqual(validateEscrowId("42"), 42n);
    });

    it("rejects non-positive IDs", () => {
      assert.throws(() => validateEscrowId(0), ValidationError);
      assert.throws(() => validateEscrowId(-1), ValidationError);
    });
  });

  describe("validateDeadline", () => {
    it("accepts future timestamps", () => {
      const future = Math.floor(Date.now() / 1000) + 86400;
      assert.strictEqual(validateDeadline(future), BigInt(future));
    });

    it("rejects past or expired deadlines", () => {
      const past = Math.floor(Date.now() / 1000) - 3600;
      assert.throws(() => validateDeadline(past), ValidationError);
    });
  });

  describe("validateSplit", () => {
    it("accepts exact sum splits", () => {
      const res = validateSplit(700, 300, 1000);
      assert.strictEqual(res.freelancerAmount, 700n);
      assert.strictEqual(res.clientAmount, 300n);
    });

    it("rejects mismatching sum or negative splits", () => {
      assert.throws(() => validateSplit(600, 300, 1000), ValidationError);
      assert.throws(() => validateSplit(-100, 1100, 1000), ValidationError);
    });
  });
});
