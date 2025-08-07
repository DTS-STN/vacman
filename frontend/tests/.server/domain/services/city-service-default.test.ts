import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { AppError } from '~/errors/app-error';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const mockCities = {
  content: [
    {
      id: 1,
      code: 'CITY-1',
      nameEn: 'City One',
      nameFr: 'Ville Un',
      provinceTerritory: { id: '1', code: 'ABC', nameEn: 'Province One', nameFr: 'Province Un' },
    },
    {
      id: 2,
      code: 'CITY-2',
      nameEn: 'City Two',
      nameFr: 'Ville Deux',
      provinceTerritory: { id: '2', code: 'XYZ', nameEn: 'Province Two', nameFr: 'Province Deux' },
    },
  ],
};

const service = getDefaultCityService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultCityService', () => {
  it('listAll should return cities on success', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities,
    });

    const result = await service.listAll();
    expect(result).toEqual(mockCities.content);
    expect(result.length).toBe(2);
  });

  it('getById should return a city if found', async () => {
    // CORRECT: Mocks the full list
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCities),
    });

    const result = await service.getById(1);
    expect(result.isOk()).toBe(true);
  });

  it('getById should return not found error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.getById(999);
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(AppError);
  });

  it('findLocalizedById should return Some if city exists', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCities),
    });

    const result = await service.findLocalizedById(1, 'en');
    expect(result.isSome()).toBe(true);
    expect(result.unwrap().id).toBe(1);
  });

  it('findLocalizedById should return None if city does not exist', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.findLocalizedById(999, 'en');
    expect(result.isNone()).toBe(true);
  });

  it('listAllLocalized should return localized cities in English', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities,
    });

    const result = await service.listAllLocalized('en');
    expect(result[0]?.name).toBe('City One');
    expect(result[1]?.name).toBe('City Two');
    expect(result.length).toBe(2);
  });

  it('getLocalizedById should return localized city', async () => {
    // MOCK THE FULL LIST
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCities),
    });

    const result = await service.getLocalizedById(1, 'fr');
    expect(result.isOk()).toBe(true);
  });
});
