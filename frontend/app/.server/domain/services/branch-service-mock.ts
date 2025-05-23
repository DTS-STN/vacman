import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import esdcBranchData from '~/.server/resources/esdc_branchandregions.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

/**
 * Retrieves a list of all esdc branches.
 *
 * @returns An array of esdc branch objects.
 */
export function getBranches(): readonly Branch[] {
  return esdcBranchData.content.map((branch) => ({
    id: branch.id,
    nameEn: branch.nameEn,
    nameFr: branch.nameFr,
  }));
}

/**
 * Retrieves a single branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @returns The branch object if found.
 * @throws {AppError} If the branch is not found.
 */
export function getBranchById(id: string): Branch {
  const branch = getBranches().find((p) => p.id === id);
  if (!branch) {
    throw new AppError(`Branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND);
  }
  return branch;
}

/**
 * Retrieves a list of branches localized to the specified language.
 *
 * @param language The language to localize the branch names to.
 * @returns An array of localized branch objects.
 */
export function getLocalizedBranches(language: Language): readonly LocalizedBranch[] {
  return getBranches()
    .map((branch) => ({
      id: branch.id,
      name: language === 'fr' ? branch.nameFr : branch.nameEn,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
}

/**
 * Retrieves a single localized branch by its ID.
 *
 * @param id The ID of the branch to retrieve.
 * @param language The language to localize the branch name to.
 * @returns The localized branch object if found.
 * @throws {AppError} If the branch is not found.
 */
export function getLocalizedBranchById(id: string, language: Language): LocalizedBranch {
  const branch = getLocalizedBranches(language).find((p) => p.id === id);
  if (!branch) {
    throw new AppError(`Localized branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND);
  }
  return branch;
}
