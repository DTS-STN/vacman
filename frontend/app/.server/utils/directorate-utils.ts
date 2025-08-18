import type { LocalizedDirectorate, LocalizedBranch, Directorate, Branch } from '../domain/models';

/**
 * Extracts unique branches from directorates that have parent branches.
 * This utility filters directorates to only include those with non-null parents,
 * extracts the parent branches, deduplicates them, and sorts them by name.
 *
 * @param directorates Array of localized directorates
 * @returns Array of unique localized branches sorted by name
 */
export function extractUniqueBranchesFromDirectorates(directorates: readonly LocalizedDirectorate[]): LocalizedBranch[] {
  return directorates
    .filter(
      (directorate): directorate is typeof directorate & { parent: NonNullable<typeof directorate.parent> } =>
        directorate.parent !== null,
    )
    .map((directorate) => directorate.parent)
    .filter(
      (() => {
        const seen = new Set<number>();
        return (branch: LocalizedBranch) => !seen.has(branch.id) && seen.add(branch.id);
      })(),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
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
  return directorates
    .filter(
      (directorate): directorate is typeof directorate & { parent: NonNullable<typeof directorate.parent> } =>
        directorate.parent !== null,
    )
    .map((directorate) => directorate.parent)
    .filter(
      (() => {
        const seen = new Set<number>();
        return (branch: Branch) => !seen.has(branch.id) && seen.add(branch.id);
      })(),
    )
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}
