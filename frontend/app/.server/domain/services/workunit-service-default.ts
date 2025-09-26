import type { WorkUnit, LocalizedWorkUnit } from '~/.server/domain/models';
import { LookupServiceImplementation } from '~/.server/domain/services/shared/lookup-service-implementation';
import type { WorkUnitService } from '~/.server/domain/services/workunit-service';
import { ErrorCodes } from '~/errors/error-codes';

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

class WorkUnitServiceImplementation extends LookupServiceImplementation<WorkUnit, LocalizedWorkUnit> {
  constructor() {
    super({
      apiEndpoint: '/codes/work-units',
      entityName: 'ESDC Work Units',
      notFoundErrorCode: ErrorCodes.NO_WORKUNIT_FOUND,
      localizeEntity: localizeWorkUnit,
    });
  }

  async listBranches(): Promise<readonly WorkUnit[]> {
    const allWorkUnits = await this.listAll();
    return allWorkUnits.filter((workUnit) => workUnit.parent === null);
  }

  async listDirectorates(): Promise<readonly WorkUnit[]> {
    const allWorkUnits = await this.listAll();
    return allWorkUnits.filter((workUnit) => workUnit.parent !== null);
  }

  async listLocalizedBranches(language: Language): Promise<readonly LocalizedWorkUnit[]> {
    const branches = await this.listBranches();
    return branches.map((branch) => localizeWorkUnit(branch, language));
  }

  async listLocalizedDirectorates(language: Language): Promise<readonly LocalizedWorkUnit[]> {
    const directorates = await this.listDirectorates();
    return directorates.map((directorate) => localizeWorkUnit(directorate, language));
  }

  async getDirectoratesByBranch(branchId: number): Promise<readonly WorkUnit[]> {
    const directorates = await this.listDirectorates();
    return directorates.filter((directorate) => directorate.parent?.id === branchId);
  }

  async getLocalizedDirectoratesByBranch(branchId: number, language: Language): Promise<readonly LocalizedWorkUnit[]> {
    const directorates = await this.getDirectoratesByBranch(branchId);
    return directorates.map((directorate) => localizeWorkUnit(directorate, language));
  }
}

export const workUnitService: WorkUnitService = new WorkUnitServiceImplementation();

export function getDefaultWorkUnitService(): WorkUnitService {
  return workUnitService;
}
