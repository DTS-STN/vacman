import { describe, it, expect } from 'vitest';

import { getMockBranchService } from '~/.server/domain/services/branch-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

const service = getMockBranchService();

describe('getMockBranchService', () => {
  it('should return all mock branches data', async () => {
    const result = await service.listAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return a branch by ID', async () => {
    const all = await service.listAll();
    expect(all.length).toBeGreaterThan(0);

    const first = all[0];
    if (!first) {
      throw new Error('Expected at least one branch in the list');
    }

    const result = await service.getById(first.id);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe(first.id);
  });

  it('should return error if branch ID not found', async () => {
    const result = await service.getById(25);
    expect(result.isErr()).toBe(true);

    const err = result.unwrapErr();
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).msg).toContain('not found');
  });

  it('should find a branch by ID using Option', async () => {
    const branches = await service.listAll();
    const first = branches[0];
    if (!first) {
      throw new AppError('Expected at least one branch in the list');
    }

    const result = await service.findLocalizedById(first.id, 'en');
    expect(result.isSome()).toBe(true);
    expect(result.unwrap().id).toBe(first.id);
  });

  it('should return None if branch not found using Option', async () => {
    const result = await service.findLocalizedById(25, 'en');
    expect(result.isNone()).toBe(true);
  });

  it('should return localized branches in English', async () => {
    const result = await service.listAllLocalized('en' as Language);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
  });

  it('should return localized branches in French', async () => {
    const result = await service.listAllLocalized('fr' as Language);
    expect(result[0]).toHaveProperty('name');
  });

  it('should return a localized branch by ID', async () => {
    const localizedBranches = await service.listAllLocalized('en' as Language);
    const first = localizedBranches[0];
    if (!first) {
      throw new AppError('Expected at least one branch in the list');
    }

    const result = await service.getLocalizedById(first.id, 'en' as Language);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().id).toBe(first.id);
  });

  it('should return error if localized branch ID not found', async () => {
    const result = await service.getLocalizedById(25, 'en' as Language);
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_BRANCH_FOUND);
  });
});
