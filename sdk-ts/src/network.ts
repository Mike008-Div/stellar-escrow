/**
 * Network configuration profiles for Stellar Escrow SDK
 */

export interface NetworkProfile {
  name: "local" | "testnet" | "mainnet" | "custom";
  rpcUrl: string;
  networkPassphrase: string;
  horizonUrl: string;
  friendbotUrl?: string;
}

export const NETWORKS: Record<"LOCAL" | "TESTNET" | "MAINNET", NetworkProfile> = {
  LOCAL: {
    name: "local",
    rpcUrl: "http://localhost:8000/soroban/rpc",
    networkPassphrase: "Standalone Network ; February 2017",
    horizonUrl: "http://localhost:8000",
    friendbotUrl: "http://localhost:8000/friendbot",
  },
  TESTNET: {
    name: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    friendbotUrl: "https://friendbot.stellar.org",
  },
  MAINNET: {
    name: "mainnet",
    rpcUrl: "https://mainnet.sorobanrpc.com",
    networkPassphrase: "Public Global Stellar Network ; July 2015",
    horizonUrl: "https://horizon.stellar.org",
  },
};

export type NetworkInput = "local" | "testnet" | "mainnet" | Partial<NetworkProfile>;

/**
 * Resolves a network input (name or custom object) into a complete, validated NetworkProfile.
 */
export function resolveNetworkConfig(input?: NetworkInput): NetworkProfile {
  if (!input) {
    return { ...NETWORKS.TESTNET };
  }

  if (typeof input === "string") {
    const key = input.toUpperCase() as keyof typeof NETWORKS;
    if (NETWORKS[key]) {
      return { ...NETWORKS[key] };
    }
    throw new Error(
      `Unknown network profile: '${input}'. Supported profiles: local, testnet, mainnet`
    );
  }

  // Custom configuration object with potential profile base
  let baseProfile: NetworkProfile = { ...NETWORKS.TESTNET };
  if (input.name && input.name !== "custom") {
    const key = input.name.toUpperCase() as keyof typeof NETWORKS;
    if (NETWORKS[key]) {
      baseProfile = { ...NETWORKS[key] };
    }
  }

  const resolved: NetworkProfile = {
    name: input.name || "custom",
    rpcUrl: input.rpcUrl || baseProfile.rpcUrl,
    networkPassphrase: input.networkPassphrase || baseProfile.networkPassphrase,
    horizonUrl: input.horizonUrl || baseProfile.horizonUrl,
    friendbotUrl: input.friendbotUrl || baseProfile.friendbotUrl,
  };

  if (!resolved.rpcUrl || !resolved.rpcUrl.startsWith("http")) {
    throw new Error(`Invalid RPC URL: '${resolved.rpcUrl}'. Must start with http:// or https://`);
  }

  if (!resolved.networkPassphrase || resolved.networkPassphrase.trim().length === 0) {
    throw new Error("Invalid network passphrase: must be a non-empty string");
  }

  return resolved;
}
