import type { RawContractEvent, ParsedEscrowEvent, EscrowRecord } from "./types.ts";

export class EventProcessor {
  /**
   * Parse a raw Soroban event into a structured ParsedEscrowEvent.
   */
  public parseEvent(raw: RawContractEvent): ParsedEscrowEvent | null {
    if (!raw.topic || raw.topic.length < 2) return null;
    if (raw.topic[0] !== "Escrow") return null;

    const eventType = raw.topic[1] as ParsedEscrowEvent["eventType"];
    const val = raw.value;

    let escrowId: bigint;
    let payload: Record<string, any> = {};

    switch (eventType) {
      case "Created":
        escrowId = BigInt(val[0]);
        payload = {
          client: String(val[1]),
          freelancer: String(val[2]),
          amount: String(val[3]),
        };
        break;
      case "Funded":
        escrowId = BigInt(val[0]);
        payload = { amount: String(val[1]) };
        break;
      case "Released":
        escrowId = BigInt(val[0]);
        payload = {
          freelancer: String(val[1]),
          amount: String(val[2]),
        };
        break;
      case "PartRel":
        escrowId = BigInt(val[0]);
        payload = {
          freelancerAmount: String(val[1]),
          clientAmount: String(val[2]),
        };
        break;
      case "Refunded":
        escrowId = BigInt(val[0]);
        payload = {
          client: String(val[1]),
          amount: String(val[2]),
        };
        break;
      case "Disputed":
        escrowId = BigInt(val[0]);
        payload = { raisedBy: String(val[1]) };
        break;
      case "Resolved":
        escrowId = BigInt(val[0]);
        payload = {
          winner: String(val[1]),
          amount: String(val[2]),
        };
        break;
      case "Cancelled":
        escrowId = BigInt(val[0]);
        payload = { client: String(val[1]) };
        break;
      case "ArbUpd":
        escrowId = BigInt(val[0]);
        payload = { newArbiter: String(val[1]) };
        break;
      default:
        return null;
    }

    return {
      escrowId,
      eventType,
      ledgerSequence: BigInt(raw.ledger),
      txHash: raw.txHash,
      payload,
    };
  }

  /**
   * Apply a parsed event to compute the next escrow state.
   */
  public applyEvent(
    current: EscrowRecord | null,
    event: ParsedEscrowEvent
  ): EscrowRecord {
    if (event.eventType === "Created") {
      return {
        id: event.escrowId,
        client: event.payload.client || "",
        freelancer: event.payload.freelancer || "",
        arbiter: event.payload.arbiter || "",
        token: event.payload.token || "",
        amount: event.payload.amount || "0",
        deadline: BigInt(event.payload.deadline || 0),
        status: "Created",
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
      };
    }

    if (!current) {
      throw new Error(
        `Cannot apply event ${event.eventType} on non-existent escrow #${event.escrowId}`
      );
    }

    const updated: EscrowRecord = { ...current };

    switch (event.eventType) {
      case "Funded":
        updated.status = "Funded";
        break;
      case "Released":
      case "PartRel":
        updated.status = "Released";
        break;
      case "Refunded":
        updated.status = "Refunded";
        break;
      case "Disputed":
        updated.status = "Disputed";
        break;
      case "Resolved":
        updated.status = "Resolved";
        break;
      case "Cancelled":
        updated.status = "Cancelled";
        break;
      case "ArbUpd":
        updated.arbiter = event.payload.newArbiter;
        break;
    }

    return updated;
  }
}
