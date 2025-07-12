import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import type { BranchService } from '~/.server/domain/services/branch-service';
import workUnitData from '~/.server/resources/workUnit.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockBranchService(): BranchService {
  return {
    listAll: () => Promise.resolve(listAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all esdc branches.
 *
 * @returns A promise that resolves to an array of esdc branches objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): Branch[] {
  const branches: Branch[] = workUnitData.content
    .filter((c) => c.parent === null)
    .map((branch) => ({
      id: branch.id.toString(),
      code: branch.code,
      nameEn: branch.nameEn,
      nameFr: branch.nameFr,
    }));
  return branches;
}

/**
 * Retrieves a single branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @returns The branch object if found or {AppError} If the branch is not found.
 */
function getById(id: string): Result<Branch, AppError> {
  const result = listAll();
  const branch = result.find((p) => p.id === id);

  return branch ? Ok(branch) : Err(new AppError(`Branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
}

/**
 * Retrieves a single branch by its ID.
 *
 * @param code The CODE of the branch to retrieve.
 * @returns The branch object if found or {AppError} If the branch is not found.
 */
function getByCode(code: string): Result<Branch, AppError> {
  const result = listAll();
  const branch = result.find((p) => p.code === code);

  return branch ? Ok(branch) : Err(new AppError(`Branch with CODE '${code}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
}

/**
 * Retrieves a list of all branchs, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized branch objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedBranch[] {
  return listAll()
    .map((branch) => ({
      id: branch.id,
      code: branch.code,
      name: language === 'fr' ? branch.nameFr : branch.nameEn,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
}

/**
 * Retrieves a single localized branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @param language The language to localize the branch name to.
 * @returns The localized branch object if found or {AppError} If the branch is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedBranch, AppError> {
  const result = getById(id);
  return result.map((branch) => ({
    id: branch.id,
    code: branch.code,
    name: language === 'fr' ? branch.nameFr : branch.nameEn,
  }));
}

/**
 * Retrieves a single localized branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized branch object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedBranch> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized branch by its CODE.
 *
 * @param code The CODE of the branch to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized branch object if found or {AppError} If the branch is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedBranch, AppError> {
  const result = getByCode(code);
  return result.map((branch) => ({
    id: branch.id,
    code: branch.code,
    name: language === 'fr' ? branch.nameFr : branch.nameEn,
  }));
}

/**
 * Retrieves a single localized branch by its CODE.
 *
 * @param code The CODE of the branch to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized branch object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedBranch> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
