import type React from 'react';

import type { SetURLSearchParams } from 'react-router';

import type { PageMetadata } from '~/.server/domain/models';
import { clamp } from '~/utils/math-utils';

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

/**
 * Returns a new URLSearchParams with the page parameter set to the provided target (no clamping).
 */
export function getNextSearchParamsForPage(
  searchParams: URLSearchParams,
  targetPage: number,
  paramName = 'page',
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  next.set(paramName, String(targetPage));
  return next;
}

/**
 * Factory for a click handler that updates the page query string parameter.
 * Captures the provided searchParams at creation time similar to inline handlers.
 */
export function makePageClickHandler(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  targetPage: number,
  paramName = 'page',
) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    const next = getNextSearchParamsForPage(searchParams, targetPage, paramName);
    setSearchParams(next, { preventScrollReset: true });
  };
}

/** Clamp a page to the inclusive range [1, totalPages]. */
export function clampPage(page: number, totalPages: number): number {
  return clamp(page, 1, Math.max(1, totalPages));
}

/** Previous page, clamped to 1. */
export function prevPage(currentPage: number): number {
  return Math.max(1, currentPage - 1);
}

/** Next page, clamped to totalPages. */
export function nextPage(currentPage: number, totalPages: number): number {
  return clampPage(currentPage + 1, totalPages);
}

/**
 * Returns a range based on current rows and PageMetadata.
 */
export function getPageItemsRange(rows: number, page: PageMetadata): { start: number; end: number } {
  if (rows <= 0) {
    return {
      start: 0,
      end: 0,
    };
  }
  const base = page.number * page.size;
  return {
    start: base + 1,
    end: base + rows,
  };
}

export const MAX_PAGE_SIZE = 200;
