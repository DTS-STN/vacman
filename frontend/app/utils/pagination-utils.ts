/**
 * Returns a 1-based current page number clamped to [1, totalPages].
 */
export function getCurrentPage(
  searchParams: URLSearchParams,
  paramName = 'page',
  totalPages = Number.POSITIVE_INFINITY,
): number {
  const raw = searchParams.get(paramName);
  const n = Math.max(1, Number.parseInt(raw ?? '1', 10) || 1);
  const upper = Math.max(1, Number.isFinite(totalPages) ? totalPages : Number.MAX_SAFE_INTEGER);
  return Math.min(n, upper);
}

/**
 * Build a compact pagination item list with optional ellipses.
 * When totalPages <= threshold, returns [1..totalPages].
 * When totalPages > threshold, returns: [1, ..., window..., ..., totalPages].
 *
 * @returns array containing page numbers and the string 'ellipsis'
 */
export function getPageItems(
  totalPages: number,
  currentPage: number,
  options?: { delta?: number; threshold?: number },
): (number | 'ellipsis')[] {
  const threshold = options?.threshold ?? 9;
  const delta = options?.delta ?? 2; // pages around current

  if (totalPages <= 1) return [1];
  if (totalPages <= threshold) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const first = 1;
  const last = totalPages;
  const items: (number | 'ellipsis')[] = [first];

  const left = Math.max(first + 1, currentPage - delta);
  const right = Math.min(last - 1, currentPage + delta);

  if (left > first + 1) items.push('ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < last - 1) items.push('ellipsis');

  items.push(last);
  return items;
}
