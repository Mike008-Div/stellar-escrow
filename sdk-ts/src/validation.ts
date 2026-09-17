/**
 * Input validation helpers for Stellar Escrow SDK
 */

export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;

  constructor(field: string, message: string, code: string = "INVALID_INPUT") {
    super(`[ValidationError: ${field}] ${message}`);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
  }
}

/**
 * Validates a Stellar public key (G...) or contract address (C...).
 */
export function validateAddress(address: string, fieldName: string = "address"): string {
  if (!address || typeof address !== "string") {
    throw new ValidationError(fieldName, "Address must be a non-empty string", "MISSING_ADDRESS");
  }

  const trimmed = address.trim();
  // Standard Stellar public key or contract address is 56 alphanumeric characters (base32)
  const stellarAddressRegex = /^[G|C][A-Z2-7]{55}$/;
  if (!stellarAddressRegex.test(trimmed)) {
    throw new ValidationError(
      fieldName,
      `Invalid Stellar address format for '${fieldName}'. Must be a 56-character string starting with 'G' or 'C'`,
      "INVALID_ADDRESS_FORMAT"
    );
  }

  return trimmed;
}

/**
 * Validates that an amount is strictly positive and converts to bigint.
 */
export function validateAmount(amount: bigint | number | string, fieldName: string = "amount"): bigint {
  if (amount === undefined || amount === null) {
    throw new ValidationError(fieldName, "Amount is required", "MISSING_AMOUNT");
  }

  let val: bigint;
  try {
    val = BigInt(amount);
  } catch {
    throw new ValidationError(fieldName, "Amount must be a valid integer or numeric string", "INVALID_AMOUNT_FORMAT");
  }

  if (val <= 0n) {
    throw new ValidationError(fieldName, "Amount must be strictly greater than 0", "AMOUNT_NOT_POSITIVE");
  }

  return val;
}

/**
 * Validates that an escrow identifier is a positive integer.
 */
export function validateEscrowId(id: bigint | number | string, fieldName: string = "escrowId"): bigint {
  if (id === undefined || id === null) {
    throw new ValidationError(fieldName, "Escrow identifier is required", "MISSING_ESCROW_ID");
  }

  let val: bigint;
  try {
    val = BigInt(id);
  } catch {
    throw new ValidationError(fieldName, "Escrow ID must be a valid integer", "INVALID_ID_FORMAT");
  }

  if (val <= 0n) {
    throw new ValidationError(fieldName, "Escrow ID must be a positive number (> 0)", "ID_NOT_POSITIVE");
  }

  return val;
}

/**
 * Validates that a deadline is a valid future Unix timestamp (in seconds).
 */
export function validateDeadline(
  deadline: bigint | number | string,
  minFutureSeconds: number = 60,
  fieldName: string = "deadline"
): bigint {
  if (deadline === undefined || deadline === null) {
    throw new ValidationError(fieldName, "Deadline timestamp is required", "MISSING_DEADLINE");
  }

  let val: bigint;
  try {
    val = BigInt(deadline);
  } catch {
    throw new ValidationError(fieldName, "Deadline must be a valid unix timestamp integer", "INVALID_DEADLINE_FORMAT");
  }

  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const minRequired = nowSec + BigInt(minFutureSeconds);

  if (val <= nowSec) {
    throw new ValidationError(fieldName, "Deadline must be in the future", "DEADLINE_IN_PAST");
  }

  return val;
}

/**
 * Validates that partial release amounts sum exactly to the total escrow amount.
 */
export function validateSplit(
  freelancerAmount: bigint | number | string,
  clientAmount: bigint | number | string,
  totalAmount: bigint | number | string
): { freelancerAmount: bigint; clientAmount: bigint } {
  const f = BigInt(freelancerAmount);
  const c = BigInt(clientAmount);
  const total = BigInt(totalAmount);

  if (f < 0n || c < 0n) {
    throw new ValidationError("split", "Split amounts must be non-negative", "NEGATIVE_SPLIT_AMOUNT");
  }

  if (f + c !== total) {
    throw new ValidationError(
      "split",
      `Split amounts (${f} + ${c} = ${f + c}) do not sum to total escrow amount (${total})`,
      "SPLIT_SUM_MISMATCH"
    );
  }

  return { freelancerAmount: f, clientAmount: c };
}
