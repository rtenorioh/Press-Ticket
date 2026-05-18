import AppError from "../errors/AppError";

/**
 * Converts and validates that a value from req.params/req.query is a valid
 * positive integer. Throws AppError 400 if invalid.
 */
export function validateId(value: unknown, field = "id"): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError(`${field} inválido`, 400);
  }
  return n;
}
