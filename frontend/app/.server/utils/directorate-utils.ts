import type { LocalizedDirectorate, LocalizedBranch, Directorate, Branch } from '~/.server/domain/models';

/**
 * Extracts unique branches from directorates that have parent branches.
 * This utility filters directorates to only include those with non-null parents,
 * extracts the parent branches, deduplicates them, and sorts them by name.
 *
 * @param directorates Array of localized directorates
 * @returns Array of unique localized branches sorted by name
 */
export function extractUniqueBranchesFromDirectorates(directorates: readonly LocalizedDirectorate[]): LocalizedBranch[] {
  const branchesMap = new Map<number, LocalizedBranch>();
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
export function extractUniqueBranchesFromDirectoratesNonLocalized(directorates: readonly Directorate[]): Branch[] {
  const branchesMap = new Map<number, Branch>();
  for (const directorate of directorates) {
    if (directorate.parent) branchesMap.set(directorate.parent.id, directorate.parent);
  }
  return Array.from(branchesMap.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}
