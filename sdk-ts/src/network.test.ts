import { describe, it } from "node:test";
import assert from "node:assert";
import { NETWORKS, resolveNetworkConfig } from "./network.ts";

describe("SDK Network Configuration Profiles", () => {
  it("resolves default profile to TESTNET", () => {
    const config = resolveNetworkConfig();
    assert.strictEqual(config.name, "testnet");
    assert.strictEqual(config.networkPassphrase, NETWORKS.TESTNET.networkPassphrase);
    assert.strictEqual(config.rpcUrl, NETWORKS.TESTNET.rpcUrl);
  });

  it("resolves named profiles 'local', 'testnet', 'mainnet'", () => {
    const local = resolveNetworkConfig("local");
    assert.strictEqual(local.name, "local");
    assert.strictEqual(local.rpcUrl, NETWORKS.LOCAL.rpcUrl);

    const testnet = resolveNetworkConfig("testnet");
    assert.strictEqual(testnet.name, "testnet");

    const mainnet = resolveNetworkConfig("mainnet");
    assert.strictEqual(mainnet.name, "mainnet");
    assert.strictEqual(mainnet.networkPassphrase, NETWORKS.MAINNET.networkPassphrase);
  });

  it("allows overriding specific settings on a profile", () => {
    const custom = resolveNetworkConfig({
      name: "testnet",
      rpcUrl: "https://my-custom-rpc.example.com",
    });
    assert.strictEqual(custom.name, "testnet");
    assert.strictEqual(custom.rpcUrl, "https://my-custom-rpc.example.com");
    assert.strictEqual(custom.networkPassphrase, NETWORKS.TESTNET.networkPassphrase);
  });

  it("rejects unknown network name string", () => {
    assert.throws(() => resolveNetworkConfig("invalidnet" as any), /Unknown network profile/);
  });

  it("rejects invalid RPC URLs", () => {
    assert.throws(
      () => resolveNetworkConfig({ rpcUrl: "not-a-url" }),
      /Invalid RPC URL/
    );
  });
});
