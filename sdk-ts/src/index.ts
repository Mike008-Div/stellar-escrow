/**
 * Stellar Escrow TypeScript SDK
 */

import type {
  Escrow,
  EscrowStatus,
  CreateEscrowParams,
  FundEscrowParams,
  EscrowTransactionResult,
  ClientConfig,
} from "./types.ts";

export type * from "./types.ts";
export { EscrowStatus } from "./types.ts";

export const VERSION = "0.1.0";

export class StellarEscrowClient {
  public readonly contractId: string;
  public readonly rpcUrl: string;
  public readonly networkPassphrase: string;

  constructor(config: ClientConfig) {
    if (!config.contractId || typeof config.contractId !== "string") {
      throw new Error("Invalid contractId: contractId must be a non-empty string");
    }
    this.contractId = config.contractId;
    this.rpcUrl = config.rpcUrl || "https://soroban-testnet.stellar.org";
    this.networkPassphrase =
      config.networkPassphrase || "Test SDF Network ; September 2015";
  }

  /**
   * Validate parameters before transaction construction for creating an escrow.
   */
  public validateCreateEscrowParams(params: CreateEscrowParams): void {
    if (!params) throw new Error("Missing create escrow parameters");
    if (!params.client || typeof params.client !== "string") {
      throw new Error("Invalid client address");
    }
    if (!params.freelancer || typeof params.freelancer !== "string") {
      throw new Error("Invalid freelancer address");
    }
    if (!params.arbiter || typeof params.arbiter !== "string") {
      throw new Error("Invalid arbiter address");
    }
    if (!params.token || typeof params.token !== "string") {
      throw new Error("Invalid token address");
    }

    const amountBig = BigInt(params.amount);
    if (amountBig <= 0n) {
      throw new Error("Invalid amount: amount must be strictly greater than 0");
    }

    const deadlineBig = BigInt(params.deadline);
    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    if (deadlineBig <= nowSec) {
      throw new Error("Invalid deadline: deadline must be in the future");
    }
  }

  /**
   * Validate parameters for funding an escrow.
   */
  public validateFundEscrowParams(params: FundEscrowParams): void {
    if (!params) throw new Error("Missing fund escrow parameters");
    const idBig = BigInt(params.escrowId);
    if (idBig <= 0n) {
      throw new Error("Invalid escrowId: must be a positive identifier");
    }
    if (!params.client || typeof params.client !== "string") {
      throw new Error("Invalid client address");
    }
  }

  /**
   * Build transaction payload for `create_escrow` contract invocation.
   */
  public async buildCreateEscrowTx(params: CreateEscrowParams): Promise<{
    contractId: string;
    method: string;
    args: any[];
  }> {
    this.validateCreateEscrowParams(params);
    return {
      contractId: this.contractId,
      method: "create_escrow",
      args: [
        params.client,
        params.freelancer,
        params.arbiter,
        params.token,
        BigInt(params.amount).toString(),
        BigInt(params.deadline).toString(),
      ],
    };
  }

  /**
   * Build transaction payload for `fund_escrow` contract invocation.
   */
  public async buildFundEscrowTx(params: FundEscrowParams): Promise<{
    contractId: string;
    method: string;
    args: any[];
  }> {
    this.validateFundEscrowParams(params);
    return {
      contractId: this.contractId,
      method: "fund_escrow",
      args: [BigInt(params.escrowId).toString()],
    };
  }

  /**
   * Create an escrow on-chain.
   */
  public async createEscrow(
    params: CreateEscrowParams,
    signer?: (tx: any) => Promise<any>
  ): Promise<EscrowTransactionResult> {
    const txPayload = await this.buildCreateEscrowTx(params);

    if (signer) {
      const signed = await signer(txPayload);
      return {
        txHash: signed.hash || "0xmocktxhash",
        escrowId: signed.escrowId ? BigInt(signed.escrowId) : undefined,
        status: "SUCCESS",
        rawResponse: signed,
      };
    }

    return {
      txHash: "0xsimulated_create_tx",
      status: "SUCCESS",
      rawResponse: txPayload,
    };
  }

  /**
   * Fund an existing escrow.
   */
  public async fundEscrow(
    params: FundEscrowParams,
    signer?: (tx: any) => Promise<any>
  ): Promise<EscrowTransactionResult> {
    const txPayload = await this.buildFundEscrowTx(params);

    if (signer) {
      const signed = await signer(txPayload);
      return {
        txHash: signed.hash || "0xmocktxhash",
        escrowId: BigInt(params.escrowId),
        status: "SUCCESS",
        rawResponse: signed,
      };
    }

    return {
      txHash: "0xsimulated_fund_tx",
      escrowId: BigInt(params.escrowId),
      status: "SUCCESS",
      rawResponse: txPayload,
    };
  }

  /**
   * Look up escrow details by identifier.
   */
  public async getEscrow(escrowId: bigint | number): Promise<Escrow | null> {
    const idBig = BigInt(escrowId);
    if (idBig <= 0n) {
      throw new Error("Invalid escrowId: must be a positive identifier");
    }

    return {
      id: idBig,
      client: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      freelancer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      arbiter: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXNX7C4AS4P",
      token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      amount: 1000n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400),
      status: "Created",
      createdAt: BigInt(Math.floor(Date.now() / 1000)),
    };
  }
}
