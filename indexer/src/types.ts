export interface IndexerConfig {
  databaseUrl: string;
  rpcUrl: string;
  contractId: string;
  pollIntervalMs: number;
  startLedger?: number;
}

export interface RawContractEvent {
  id: string;
  contractId: string;
  topic: string[];
  value: any;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
}

export interface ParsedEscrowEvent {
  escrowId: bigint;
  eventType:
    | "Created"
    | "Funded"
    | "Released"
    | "PartRel"
    | "Refunded"
    | "Disputed"
    | "Resolved"
    | "Cancelled"
    | "ArbUpd";
  ledgerSequence: bigint;
  txHash: string;
  payload: Record<string, any>;
}

export interface EscrowRecord {
  id: bigint;
  client: string;
  freelancer: string;
  arbiter: string;
  token: string;
  amount: string;
  deadline: bigint;
  status: string;
  createdAt: bigint;
  updatedAt?: Date;
}
