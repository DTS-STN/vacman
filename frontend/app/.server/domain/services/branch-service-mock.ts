import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import type { BranchService } from '~/.server/domain/services/branch-service';
import esdcBranchData from '~/.server/resources/esdc_branchandregions.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockBranchService(): BranchService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getLocalized: (language: Language) => Promise.resolve(getLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
  };
}

/**
 * Retrieves a list of all esdc branches.
 *
 * @returns An array of esdc branch objects.
 */
function getAll(): Result<readonly Branch[], AppError> {
  const branches: Branch[] = esdcBranchData.content.map((branch) => ({
    id: branch.id,
    nameEn: branch.nameEn,
    nameFr: branch.nameFr,
  }));

  return Ok(branches);
}

/**
 * Retrieves a single branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @returns The branch object if found.
 * @throws {AppError} If the branch is not found.
 */
function getById(id: string): Result<Branch, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const branches = result.unwrap();
  const branch = branches.find((p) => p.id === id);

  return branch ? Ok(branch) : Err(new AppError(`Localized branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
}

/**
 * Retrieves a single branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @returns The branch object if found or undefined if not found.
 */
function findById(id: string): Option<Branch> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const branches = result.unwrap();
  const branch = branches.find((p) => p.id === id);

  return branch ? Some(branch) : None;
}

/**
 * Retrieves a list of branches localized to the specified language.
 *
 * @param language The language to localize the branch names to.
 * @returns An array of localized branch objects.
 */
function getLocalized(language: Language): Result<readonly LocalizedBranch[], AppError> {
  return getAll().map((branches) =>
    branches
      .map((branch) => ({
        id: branch.id,
        name: language === 'fr' ? branch.nameFr : branch.nameEn,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' })),
  );
}

/**
 * Retrieves a single localized branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @param language The language to localize the branch name to.
 * @returns The localized branch object if found.
 * @throws {AppError} If the branch is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedBranch, AppError> {
  return getLocalized(language).andThen((branches) => {
    const branch = branches.find((b) => b.id === id);

    return branch ? Ok(branch) : Err(new AppError(`Localized branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
  });
}
