import type { LocalizedWorkUnit, WorkUnit, LocalizedLookupModel, LookupModel } from '~/.server/domain/models';

/**
 * Extracts all unique branches from work units.
 * This utility combines standalone branches (parent === null) and branches that are parents of directorates,
 * deduplicates them, and sorts them by name.
 *
 * @param workUnits Array of all localized work units (includes both branches and directorates)
 * @returns Array of unique localized branches sorted by name
 */
export function extractUniqueBranchesFromDirectorates(workUnits: readonly LocalizedWorkUnit[]): LocalizedLookupModel[] {
  const branchesMap = new Map<number, LocalizedLookupModel>();

  for (const workUnit of workUnits) {
    // Add standalone branches (work units with no parent)
    if (!workUnit.parent) {
      branchesMap.set(workUnit.id, { id: workUnit.id, code: workUnit.code, name: workUnit.name });
    }
    // Add parent branches from directorates
    if (workUnit.parent) {
      branchesMap.set(workUnit.parent.id, workUnit.parent);
    }
  }

  return Array.from(branchesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extracts all unique branches from work units (non-localized version).
 * This utility combines standalone branches (parent === null) and branches that are parents of directorates,
 * deduplicates them, and sorts them by English name.
 *
 * @param workUnits Array of all work units (includes both branches and directorates)
 * @returns Array of unique branches sorted by English name
 */
export function extractUniqueBranchesFromDirectoratesNonLocalized(workUnits: readonly WorkUnit[]): LookupModel[] {
  const branchesMap = new Map<number, LookupModel>();

  for (const workUnit of workUnits) {
    // Add standalone branches (work units with no parent)
    if (!workUnit.parent) {
      branchesMap.set(workUnit.id, { id: workUnit.id, code: workUnit.code, nameEn: workUnit.nameEn, nameFr: workUnit.nameFr });
    }
    // Add parent branches from directorates
    if (workUnit.parent) {
      branchesMap.set(workUnit.parent.id, workUnit.parent);
    }
  }

  return Array.from(branchesMap.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}

/**
 * Extracts ids of directorates from provided parent branch ids.
 *
 * @param directorates Array of localized directorates
 * @param branchIds Array of parent branch ids
 * @returns Array of directorates ids
 */
export function workUnitIdsFromBranchIds(directorates: readonly LocalizedWorkUnit[], branchIds: string[]) {
  const workUnitIds: string[] = [];
  for (const directorate of directorates) {
    if (!directorate.parent) continue;
    if (!branchIds.includes(directorate.parent.id.toString())) continue;
    workUnitIds.push(directorate.id.toString());
  }
  return workUnitIds;
}
