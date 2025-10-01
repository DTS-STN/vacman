import { randomString } from '~/utils/string-utils';

/**
 * Generate a correlation/request id.
 * Kept identical to the previous implementation from AppError to avoid name/format drift.
 */
export function generateCorrelationId(): string {
  const prefix = randomString(2).toUpperCase();
  const suffix = randomString(6).toUpperCase();
  return `${prefix}-${suffix}`;
}
