import type { Branch, HierarchicalLookupModel } from '~/.server/domain/models';
import type { BranchService } from '~/.server/domain/services/branch-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import workUnitData from '~/.server/resources/workUnit.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format and filter for branches (items without parent)
const mockData: Branch[] = (workUnitData.content as HierarchicalLookupModel[])
  .filter((workUnit) => workUnit.parent === null)
  .map((branch) => ({
    id: branch.id,
    code: branch.code,
    nameEn: branch.nameEn,
    nameFr: branch.nameFr,
  }));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<Branch>(mockData, 'branch', ErrorCodes.NO_BRANCH_FOUND);

export function getMockBranchService(): BranchService {
  return {
    listAll(): Promise<readonly Branch[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    listAllLocalized(language: Language) {
      return Promise.resolve(sharedService.listAllLocalized(language));
    },

    getLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.getLocalizedById(id, language));
    },

    findLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.findLocalizedById(id, language));
    },
  };
}
