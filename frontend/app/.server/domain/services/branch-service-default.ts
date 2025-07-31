import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import type { BranchService } from '~/.server/domain/services/branch-service';
import { LookupServiceImplementation, standardLocalize } from '~/.server/domain/services/shared/lookup-service-implementation';
import { ErrorCodes } from '~/errors/error-codes';

// Create a custom implementation that filters out items with parent property (directorates)
class BranchServiceImplementation extends LookupServiceImplementation<Branch, LocalizedBranch> {
  constructor() {
    super({
      apiEndpoint: '/codes/work-units',
      entityName: 'ESDC Branches',
      notFoundErrorCode: ErrorCodes.NO_BRANCH_FOUND,
      localizeEntity: standardLocalize,
    });
  }

  async listAll(): Promise<readonly Branch[]> {
    // Get all work units and keep only ones without a parent property
    const allWorkUnits = await super.listAll();
    return allWorkUnits.filter((workUnit: Branch & { parent?: unknown }) => !('parent' in workUnit));
  }

  async listAllLocalized(language: Language): Promise<readonly LocalizedBranch[]> {
    // Get filtered branches and localize them
    const branches = await this.listAll();
    return branches.map((branch) => standardLocalize(branch, language));
  }
}

// Export a single shared instance
export const branchService: BranchService = new BranchServiceImplementation();

/**
 * Returns the default branch service instance.
 */
export function getDefaultBranchService(): BranchService {
  return branchService;
}
