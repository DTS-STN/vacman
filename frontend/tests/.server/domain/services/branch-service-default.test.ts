import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { Branch } from '~/.server/domain/models';
import { getDefaultBranchService } from '~/.server/domain/services/branch-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Helper to convert API WorkUnit object to Branch, mirroring the implementation
function toBranch(obj: Branch): Branch {
  return {
    id: obj.id.toString(),
    code: obj.code,
    nameEn: obj.nameEn,
    nameFr: obj.nameFr,
  };
}

// More robust mock data that also tests the filtering logic in `listAll`
const mockApiData = {
  content: [
    { id: '1', code: 'B01', nameEn: 'Branch One', nameFr: 'Branche Un' },
    { id: '2', code: 'B02', nameEn: 'Branch Two', nameFr: 'Branche Deux' },
    { id: '3', code: 'S01', nameEn: 'Sub One', nameFr: 'Sous Un', parent: { id: '1' } }, // This should be filtered out
  ],
};

const mockBranchList = mockApiData.content.filter((c) => !('parent' in c)).map(toBranch);
const singleMockBranch = mockApiData.content[0];

const service = getDefaultBranchService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultBranchService', () => {
  it('listAll should return a filtered and mapped list of branches on success', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiData),
    });

    const result = await service.listAll();
    expect(result).toEqual(mockBranchList);
    expect(result.length).toBe(2);
  });

  it('getById should return an Ok result with a branch if found', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(singleMockBranch),
    });

    const result = await service.getById('1');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(singleMockBranch);
  });

  it('getById should return an Err result for a 404 Not Found status', async () => {
    // Mock a non-ok response, which will cause apiFetch to throw an AppError.
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.getById('999');
    expect(result.isErr()).toBe(true);
    const err = result.unwrapErr();
    expect(err).toBeInstanceOf(AppError);
    expect(err.errorCode).toBe(ErrorCodes.NO_BRANCH_FOUND);
    expect(err.message).toBe("Get ESDC Branches with ID '999' not found.");
  });

  it('findLocalizedById should return Some(LocalizedBranch) if branch exists', async () => {
    // This method calls getById internally, so we mock the fetch for that call.
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(singleMockBranch),
    });

    const result = await service.findLocalizedById('1', 'en');
    expect(result.isSome()).toBe(true);
    const branch = result.unwrap();
    expect(branch.id).toBe('1');
    expect(branch.name).toBe('Branch One'); // Check for correct localization
  });

  it('findLocalizedById should return None if branch does not exist (404)', async () => {
    // Mock a 404 response for the internal getById call.
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: HttpStatusCodes.NOT_FOUND,
    });

    const result = await service.findLocalizedById('999', 'en');
    // The service handles the 404, converts it to an Err, and find... converts the Err to None.
    expect(result.isNone()).toBe(true);
  });

  it('listAllLocalized should return localized branches in English', async () => {
    // Mock for the internal listAll call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiData),
    });

    const result = await service.listAllLocalized('en');
    expect(result[0]?.name).toBe('Branch One');
    expect(result[1]?.name).toBe('Branch Two');
    expect(result.length).toBe(2);
  });

  it('getLocalizedById should return an Ok result with a localized branch', async () => {
    // Mock for the internal getById call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(singleMockBranch),
    });

    const result = await service.getLocalizedById('1', 'fr');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe('Branche Un'); // Check for correct FR localization
  });
});
