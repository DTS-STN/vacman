import type { Result } from 'oxide.ts';

import type { LocalizedLookupModel, PagedRequestResponse, RequestQueryParams } from '~/.server/domain/models';
import type { AppError } from '~/errors/app-error';

/**
 * Result describing how classification search terms were interpreted.
 * `applied` indicates a filter was requested, `matched` reports whether any IDs were found.
 */
export type ClassificationSearchResult = {
  classificationIds: string[] | undefined;
  applied: boolean;
  matched: boolean;
};

/**
 * Normalizes user-entered classification strings for case-insensitive, punctuation-agnostic comparisons.
 */
const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

/**
 * Maps user-entered classification filters (codes, ids, names, comma delimited) to concrete classification IDs.
 * Returns flags so callers can distinguish between "no filter provided" and "filter applied but nothing matched".
 */
export function resolveClassificationSearch(
  rawValues: string[],
  classifications: readonly LocalizedLookupModel[],
): ClassificationSearchResult {
  const searchTerms = rawValues
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (searchTerms.length === 0) {
    return { classificationIds: undefined, applied: false, matched: false };
  }

  const matches = new Set<string>();

  for (const term of searchTerms) {
    const numericId = Number.parseInt(term, 10);
    if (!Number.isNaN(numericId)) {
      const matchById = classifications.find((classification) => classification.id === numericId);
      if (matchById) {
        matches.add(matchById.id.toString());
      }
    }

    const normalizedTerm = normalize(term);
    if (!normalizedTerm) {
      continue;
    }

    for (const classification of classifications) {
      const codeNormalized = normalize(classification.code);
      if (codeNormalized.includes(normalizedTerm)) {
        matches.add(classification.id.toString());
        continue;
      }

      const nameNormalized = normalize(classification.name);
      if (nameNormalized.includes(normalizedTerm)) {
        matches.add(classification.id.toString());
      }
    }
  }

  if (matches.size === 0) {
    return { classificationIds: undefined, applied: true, matched: false };
  }

  const classificationIds = Array.from(matches).sort((a, b) => Number(a) - Number(b));
  return { classificationIds, applied: true, matched: true };
}

/**
 * Builds an empty paged response while preserving pagination metadata from the provided query parameters.
 */
export function buildEmptyPagedRequestResponse(query: RequestQueryParams): PagedRequestResponse {
  return {
    content: [],
    page: {
      number: query.page ?? 1,
      size: query.size ?? 10,
      totalElements: 0,
      totalPages: 0,
    },
  };
}

/**
 * Shape for request service functions used by the fallback helper.
 */
type RequestFetcher = (params: RequestQueryParams) => Promise<Result<PagedRequestResponse, AppError>>;

/**
 * Returns either an empty paged response (when the classification filter had no matches) or delegates to the provided fetcher.
 */
export async function fetchRequestsWithClassificationFallback({
  filter,
  query,
  fetcher,
}: {
  filter: ClassificationSearchResult;
  query: RequestQueryParams;
  fetcher: RequestFetcher;
}): Promise<PagedRequestResponse> {
  if (filter.applied && !filter.matched) {
    return buildEmptyPagedRequestResponse(query);
  }

  const result = await fetcher(query);
  if (result.isErr()) {
    throw result.unwrapErr();
  }

  return result.unwrap();
}
