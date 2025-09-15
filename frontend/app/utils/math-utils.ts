/** Clamp a number between min and max. If value is NaN, returns min. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.min(Math.max(value, lower), upper);
}

/** Clamp a 0-based page index to a valid range given totalPages. */
export function clampPageIndex(indexZeroBased: number, totalPages: number): number {
  const maxIndex = Math.max(0, totalPages - 1);
  return clamp(indexZeroBased, 0, maxIndex);
}
