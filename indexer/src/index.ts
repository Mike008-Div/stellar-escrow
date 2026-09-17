import type { IndexerConfig } from "./types.ts";
import { EventProcessor } from "./processor.ts";

export * from "./types.ts";
export * from "./processor.ts";

export class StellarEscrowIndexer {
  private readonly config: IndexerConfig;
  private readonly processor: EventProcessor;
  private isRunning: boolean = false;

  constructor(config: Partial<IndexerConfig> = {}) {
    this.config = {
      databaseUrl:
        config.databaseUrl ||
        process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/stellar_escrow",
      rpcUrl:
        config.rpcUrl ||
        process.env.SOROBAN_RPC_URL ||
        "https://soroban-testnet.stellar.org",
      contractId:
        config.contractId ||
        process.env.ESCROW_CONTRACT_ID ||
        "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      pollIntervalMs: config.pollIntervalMs || 5000,
      startLedger: config.startLedger || 0,
    };
    this.processor = new EventProcessor();
  }

  public getConfig(): IndexerConfig {
    return { ...this.config };
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    console.log(
      `[Indexer] Starting escrow event indexer for contract: ${this.config.contractId}`
    );
    console.log(`[Indexer] RPC URL: ${this.config.rpcUrl}`);
    console.log(`[Indexer] DB URL: ${this.config.databaseUrl.replace(/:[^:@]+@/, ":****@")}`);
  }

  public stop(): void {
    this.isRunning = false;
    console.log("[Indexer] Stopped event indexer");
  }
}

if (process.argv[1] && process.argv[1].endsWith("index.ts")) {
  const indexer = new StellarEscrowIndexer();
  indexer.start().catch((err) => {
    console.error("[Indexer] Fatal error:", err);
    process.exit(1);
  });
}
