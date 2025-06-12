import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { AppError } from '~/errors/app-error';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const mockCities = [
  {
    id: '1',
    code: 'CITY-1',
    nameEn: 'City One',
    nameFr: 'Ville Un',
    province: { id: '1', code: 'ABC', nameEn: 'Province One', nameFr: 'Province Un' },
  },
  {
    id: '2',
    code: 'CITY-2',
    nameEn: 'City Two',
    nameFr: 'Ville Deux',
    province: { id: '2', code: 'XYZ', nameEn: 'Province Two', nameFr: 'Province Deux' },
  },
];

const service = getDefaultCityService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultCityService', () => {
  it('getAll should return cities on success', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities,
    });

    const result = await service.getAll();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(mockCities);
  });

  it('getAll should return error on failure', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await service.getAll();
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(AppError);
  });

  it('getById should return a city if found', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities[0],
    });

    const result = await service.getById('1');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe('1');
  });

  it('getById should return not found error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.getById('999');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(AppError);
  });

  it('findById should return Some if city exists', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCities[0]),
    });

    const result = await service.findById('1');
    expect(result.isSome()).toBe(true);
    expect(result.unwrap().id).toBe('1');
  });

  it('findById should return None if city does not exist', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.findById('999');
    expect(result.isNone()).toBe(true);
  });

  it('getLocalized should return localized cities in English', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities,
    });

    const result = await service.getAllLocalized('en');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()[0]?.name).toBe('City One');
  });

  it('getLocalizedById should return localized city', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockCities[0],
    });

    const result = await service.getLocalizedById('1', 'fr');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe('Ville Un');
  });
});
