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
