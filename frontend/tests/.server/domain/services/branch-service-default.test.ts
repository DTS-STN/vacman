import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getDefaultBranchService } from '~/.server/domain/services/branch-service-default';
import { AppError } from '~/errors/app-error';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const mockBranches = [
  { id: '1', nameEn: 'Branch One', nameFr: 'Branche Un' },
  { id: '2', nameEn: 'Branch Two', nameFr: 'Branche Deux' },
];

const service = getDefaultBranchService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultBranchService', () => {
  it('getAll should return branches on success', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches,
    });

    const result = await service.getAll();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(mockBranches);
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

  it('getById should return a branch if found', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches[0],
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

  it('findById should return Some if branch exists', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches,
    });

    const result = await service.findById('1');
    expect(result.isSome()).toBe(true);
    expect(result.unwrap().id).toBe('1');
  });

  it('findById should return None if branch does not exist', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches,
    });

    const result = await service.findById('999');
    expect(result.isNone()).toBe(true);
  });

  it('getLocalized should return localized branches in English', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches,
    });

    const result = await service.getAllLocalized('en');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()[0]?.name).toBe('Branch One');
  });

  it('getLocalizedById should return localized branch', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => mockBranches[0],
    });

    const result = await service.getLocalizedById('1', 'fr');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe('Branche Un');
  });
});
