import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EmploymentEquity } from '~/.server/domain/models';
import { getDefaultEmploymentEquityService } from '~/.server/domain/services/employment-equity-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock API data that mirrors the structure returned by the API
const mockApiData = {
  content: [
    { id: 1, code: 'WOMEN', nameEn: 'Women', nameFr: 'Femmes' },
    { id: 2, code: 'INDIGENOUS', nameEn: 'Indigenous Peoples', nameFr: 'Peuples autochtones' },
    { id: 3, code: 'VISIBLE_MINORITY', nameEn: 'Visible Minorities', nameFr: 'Minorités visibles' },
  ],
};

const mockEmploymentEquityList: EmploymentEquity[] = mockApiData.content;
const singleMockEmploymentEquity = mockApiData.content[0];

const service = getDefaultEmploymentEquityService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultEmploymentEquityService', () => {
  describe('listAll', () => {
    it('should return a list of employment equity on success', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAll();

      expect(result).toEqual(mockEmploymentEquityList);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1//codes/employment-equity');
    });

    it('should throw AppError on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.listAll()).rejects.toThrow(AppError);
      await expect(service.listAll()).rejects.toThrow(
        'A network error occurred while trying to list all employment equity codes',
      );
    });
  });

  describe('getById', () => {
    it('should return an Ok result with an employment equity if found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.getById(1);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockEmploymentEquity);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1//codes/employment-equity/1');
    });

    it('should return an Err result with AppError if not found (404)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await service.getById(999);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
    });

    it('should return an Err result with AppError on server error (500)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await service.getById(1);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
    });
  });

  describe('getByCode', () => {
    it('should return an Ok result with an employment equity if found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.getByCode('WOMEN');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockEmploymentEquity);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1//codes/employment-equity?code=WOMEN');
    });

    it('should return an Err result if code not found (empty response)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [],
          }),
      } as Response);

      const result = await service.getByCode('NON_EXISTENT');

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
    });

    it('should throw AppError on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.getByCode('WOMEN')).rejects.toThrow(AppError);
    });
  });

  describe('findById', () => {
    it('should return Some with an employment equity if found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.findById(1);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockEmploymentEquity);
    });

    it('should return None if not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await service.findById(999);

      expect(result.isNone()).toBe(true);
    });

    it('should return None on server error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await service.findById(1);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('findByCode', () => {
    it('should return Some with an employment equity if found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.findByCode('WOMEN');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockEmploymentEquity);
    });

    it('should return None if code not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [],
          }),
      } as Response);

      const result = await service.findByCode('NON_EXISTENT');

      expect(result.isNone()).toBe(true);
    });

    it('should throw AppError on server error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.findByCode('WOMEN')).rejects.toThrow(AppError);
    });
  });

  describe('listAllLocalized', () => {
    it('should return localized employment equity in English', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAllLocalized('en');

      expect(result).toHaveLength(mockEmploymentEquityList.length);
      expect(result[0]).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Women',
      });
    });

    it('should return localized employment equity in French', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAllLocalized('fr');

      expect(result).toHaveLength(mockEmploymentEquityList.length);
      expect(result[0]).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Femmes',
      });
    });

    it('should throw AppError on API failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.listAllLocalized('en')).rejects.toThrow(AppError);
    });
  });

  describe('getLocalizedById', () => {
    it('should return localized employment equity in English', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.getLocalizedById(1, 'en');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Women',
      });
    });

    it('should return localized employment equity in French', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.getLocalizedById(1, 'fr');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Femmes',
      });
    });

    it('should return Err if employment equity not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await service.getLocalizedById(999, 'en');

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND);
    });
  });

  describe('getLocalizedByCode', () => {
    it('should return localized employment equity in English', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.getLocalizedByCode('WOMEN', 'en');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Women',
      });
    });

    it('should return localized employment equity in French', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.getLocalizedByCode('WOMEN', 'fr');

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Femmes',
      });
    });
  });

  describe('findLocalizedById', () => {
    it('should return Some with localized employment equity in English', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.findLocalizedById(1, 'en');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Women',
      });
    });

    it('should return Some with localized employment equity in French', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockEmploymentEquity),
      } as Response);

      const result = await service.findLocalizedById(1, 'fr');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Femmes',
      });
    });

    it('should return None if employment equity not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await service.findLocalizedById(999, 'en');

      expect(result.isNone()).toBe(true);
    });

    it('should return None on server error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await service.findLocalizedById(1, 'en');

      expect(result.isNone()).toBe(true);
    });
  });

  describe('findLocalizedByCode', () => {
    it('should return Some with localized employment equity in English', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.findLocalizedByCode('WOMEN', 'en');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Women',
      });
    });

    it('should return Some with localized employment equity in French', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [singleMockEmploymentEquity],
          }),
      } as Response);

      const result = await service.findLocalizedByCode('WOMEN', 'fr');

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'WOMEN',
        name: 'Femmes',
      });
    });

    it('should return None if employment equity not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [],
          }),
      } as Response);

      const result = await service.findLocalizedByCode('NON_EXISTENT', 'en');

      expect(result.isNone()).toBe(true);
    });

    it('should throw AppError on server error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.findLocalizedByCode('WOMEN', 'en')).rejects.toThrow(AppError);
    });
  });
});
