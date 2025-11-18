import { Err, Ok } from 'oxide.ts';
import { describe, expect, test, vi } from 'vitest';

import type { RequestQueryParams } from '~/.server/domain/models';
import {
  buildEmptyPagedRequestResponse,
  fetchRequestsWithClassificationFallback,
  resolveClassificationSearch,
} from '~/.server/utils/request-classification-utils';
import type { ClassificationSearchResult } from '~/.server/utils/request-classification-utils';
import { AppError } from '~/errors/app-error';

const MOCK_CLASSIFICATIONS = [
  { id: 10, code: 'AS-01', name: 'Administrative Assistant' },
  { id: 20, code: 'EC-05', name: 'Economic Analyst' },
  { id: 30, code: 'PM-04', name: 'Project Manager' },
] as const;

describe('resolveClassificationSearch', () => {
  test('returns not applied when no search terms are provided', () => {
    const result = resolveClassificationSearch([], MOCK_CLASSIFICATIONS);

    expect(result).toEqual({ classificationIds: undefined, applied: false, matched: false });
  });

  test('matches against numeric identifiers, codes, and names', () => {
    const result = resolveClassificationSearch(['20, ec-05', 'Manager'], MOCK_CLASSIFICATIONS);

    expect(result).toEqual({ classificationIds: ['20', '30'], applied: true, matched: true });
  });

  test('returns applied but unmatched when no classifications match', () => {
    const result = resolveClassificationSearch(['unknown'], MOCK_CLASSIFICATIONS);

    expect(result).toEqual({ classificationIds: undefined, applied: true, matched: false });
  });

  test('deduplicates and sorts matched identifiers numerically', () => {
    const result = resolveClassificationSearch(['PM-04, 20, 10, 10'], MOCK_CLASSIFICATIONS);

    expect(result).toEqual({ classificationIds: ['10', '20', '30'], applied: true, matched: true });
  });
});

describe('buildEmptyPagedRequestResponse', () => {
  test('preserves provided pagination values', () => {
    const query: RequestQueryParams = { page: 5, size: 25 };

    const empty = buildEmptyPagedRequestResponse(query);

    expect(empty).toEqual({
      content: [],
      page: { number: 5, size: 25, totalElements: 0, totalPages: 0 },
    });
  });

  test('falls back to defaults when pagination values are missing', () => {
    const empty = buildEmptyPagedRequestResponse({});

    expect(empty.page).toEqual({ number: 1, size: 10, totalElements: 0, totalPages: 0 });
  });
});

describe('fetchRequestsWithClassificationFallback', () => {
  test('short-circuits with an empty response when classification filter had no matches', async () => {
    const filter: ClassificationSearchResult = { classificationIds: undefined, applied: true, matched: false };
    const query: RequestQueryParams = { page: 2, size: 15 };
    const fetcher = vi.fn(async () => {
      await Promise.resolve();
      throw new Error('fetcher should not be called when no matches are found');
    });

    const result = await fetchRequestsWithClassificationFallback({ filter, query, fetcher });

    expect(result).toEqual({
      content: [],
      page: { number: 2, size: 15, totalElements: 0, totalPages: 0 },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  test('delegates to the provided fetcher when matches exist', async () => {
    const filter: ClassificationSearchResult = { classificationIds: ['20'], applied: true, matched: true };
    const query: RequestQueryParams = { page: 1, size: 10 };
    const payload = {
      content: [{ id: 123 }],
      page: { number: 1, size: 10, totalElements: 1, totalPages: 1 },
    };
    const fetcher = vi.fn(async (params: RequestQueryParams) => {
      await Promise.resolve();
      expect(params).toEqual(query);
      return Ok(payload);
    });

    const result = await fetchRequestsWithClassificationFallback({ filter, query, fetcher });

    expect(result).toEqual(payload);
    expect(fetcher).toHaveBeenCalledWith(query);
  });

  test('rethrows errors from the underlying fetcher', async () => {
    const filter: ClassificationSearchResult = { classificationIds: ['10'], applied: true, matched: true };
    const query: RequestQueryParams = {};
    const error = new AppError('boom');
    const fetcher = vi.fn(async () => {
      await Promise.resolve();
      return Err(error);
    });

    await expect(fetchRequestsWithClassificationFallback({ filter, query, fetcher })).rejects.toBe(error);
    expect(fetcher).toHaveBeenCalledWith(query);
  });
});
