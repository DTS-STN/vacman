/**
 * Sanitizes a position number value by converting it to a trimmed string or undefined.
 *
 * @param value - The input value to sanitize, can be of any type
 * @returns The sanitized string value, or undefined if the input is invalid, empty, or "null"
 *
 * @example
 * ```typescript
 * sanitizePositionNumber("  123  ") // returns "123"
 * sanitizePositionNumber("null") // returns undefined
 * sanitizePositionNumber("") // returns undefined
 * sanitizePositionNumber(123) // returns undefined
 * sanitizePositionNumber("valid-position") // returns "valid-position"
 * ```
 */
export function sanitizePositionNumber(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (trimmed.toLowerCase() === 'null') {
    return undefined;
  }

  return trimmed;
}
