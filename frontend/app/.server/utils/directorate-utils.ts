import type { LocalizedWorkUnit, WorkUnit, LocalizedLookupModel, LookupModel } from '~/.server/domain/models';

/**
 * Extracts unique branches from directorates that have parent branches.
 * This utility filters directorates to only include those with non-null parents,
 * extracts the parent branches, deduplicates them, and sorts them by name.
 *
 * @param directorates Array of localized directorates
 * @returns Array of unique localized branches sorted by name
 */
export function extractUniqueBranchesFromDirectorates(directorates: readonly LocalizedWorkUnit[]): LocalizedLookupModel[] {
  const branchesMap = new Map<number, LocalizedLookupModel>();
  for (const directorate of directorates) {
    if (directorate.parent) branchesMap.set(directorate.parent.id, directorate.parent);
  }
  return Array.from(branchesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extracts unique branches from directorates that have parent branches (non-localized version).
 * This utility filters directorates to only include those with non-null parents,
 * extracts the parent branches, deduplicates them, and sorts them by English name.
 *
 * @param directorates Array of directorates
 * @returns Array of unique branches sorted by English name
 */
export function extractUniqueBranchesFromDirectoratesNonLocalized(directorates: readonly WorkUnit[]): LookupModel[] {
  const branchesMap = new Map<number, LookupModel>();
  for (const directorate of directorates) {
    if (directorate.parent) branchesMap.set(directorate.parent.id, directorate.parent);
  }
  return Array.from(branchesMap.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}
