import type { WorkUnit, LocalizedWorkUnit } from '~/.server/domain/models';
import { createCustomMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { WorkUnitService } from '~/.server/domain/services/workunit-service';
import workUnitData from '~/.server/resources/workUnit.json';
import { ErrorCodes } from '~/errors/error-codes';

const mockData: WorkUnit[] = workUnitData.content as WorkUnit[];

function localizeWorkUnit(workUnit: WorkUnit, language: Language): LocalizedWorkUnit {
  return {
    id: workUnit.id,
    code: workUnit.code,
    name: language === 'fr' ? workUnit.nameFr : workUnit.nameEn,
    parent: workUnit.parent
      ? {
          id: workUnit.parent.id,
          code: workUnit.parent.code,
          name: language === 'fr' ? workUnit.parent.nameFr : workUnit.parent.nameEn,
        }
      : null,
  };
}

const sharedService = createCustomMockLookupService<WorkUnit, LocalizedWorkUnit>(
  mockData,
  'work unit',
  ErrorCodes.NO_WORKUNIT_FOUND,
  localizeWorkUnit,
);

export function getMockWorkUnitService(): WorkUnitService {
  return {
    listAll: () => Promise.resolve(sharedService.listAll()),
    getById: (id: number) => Promise.resolve(sharedService.getById(id)),
    listAllLocalized: (language: Language) => Promise.resolve(sharedService.listAllLocalized(language)),
    getLocalizedById: (id: number, language: Language) => Promise.resolve(sharedService.getLocalizedById(id, language)),
    findLocalizedById: (id: number, language: Language) => Promise.resolve(sharedService.findLocalizedById(id, language)),

    async listBranches(): Promise<readonly WorkUnit[]> {
      const workUnits = sharedService.listAll();
      return Promise.resolve(workUnits.filter((workUnit) => workUnit.parent === null));
    },

    async listDirectorates(): Promise<readonly WorkUnit[]> {
      const workUnits = sharedService.listAll();
      return Promise.resolve(workUnits.filter((workUnit) => workUnit.parent !== null));
    },

    async listLocalizedBranches(language: Language): Promise<readonly LocalizedWorkUnit[]> {
      const workUnits = sharedService.listAllLocalized(language);
      return Promise.resolve(workUnits.filter((workUnit) => workUnit.parent === null));
    },

    async listLocalizedDirectorates(language: Language): Promise<readonly LocalizedWorkUnit[]> {
      const workUnits = sharedService.listAllLocalized(language);
      return Promise.resolve(workUnits.filter((workUnit) => workUnit.parent !== null));
    },

    async getDirectoratesByBranch(branchId: number): Promise<readonly WorkUnit[]> {
      const directorates = await this.listDirectorates();
      return directorates.filter((directorate) => directorate.parent?.id === branchId);
    },

    async getLocalizedDirectoratesByBranch(branchId: number, language: Language): Promise<readonly LocalizedWorkUnit[]> {
      const directorates = await this.getDirectoratesByBranch(branchId);
      return directorates.map((directorate) => localizeWorkUnit(directorate, language));
    },
  };
}
