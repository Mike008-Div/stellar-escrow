export const EscrowStatus = {
  Created: "Created",
  Funded: "Funded",
  Released: "Released",
  Refunded: "Refunded",
  Disputed: "Disputed",
  Resolved: "Resolved",
  Cancelled: "Cancelled",
} as const;

export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

export interface Escrow {
  id: bigint;
  client: string;
  freelancer: string;
  arbiter: string;
  token: string;
  amount: bigint;
  deadline: bigint;
  status: EscrowStatus;
  createdAt: bigint;
}

export interface CreateEscrowParams {
  client: string;
  freelancer: string;
  arbiter: string;
  token: string;
  amount: bigint | number;
  deadline: bigint | number;
}

export interface FundEscrowParams {
  escrowId: bigint | number;
  client: string;
}

export interface EscrowTransactionResult {
  txHash: string;
  escrowId?: bigint;
  status: "SUCCESS" | "FAILED";
  rawResponse?: any;
}

export interface ClientConfig {
  contractId: string;
  rpcUrl?: string;
  networkPassphrase?: string;
}
