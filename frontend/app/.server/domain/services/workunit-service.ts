import type { Result, Option } from 'oxide.ts';

import type { WorkUnit, LocalizedWorkUnit } from '~/.server/domain/models';
import { getDefaultWorkUnitService } from '~/.server/domain/services/workunit-service-default';
import { getMockWorkUnitService } from '~/.server/domain/services/workunit-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type WorkUnitService = {
  listAll(): Promise<readonly WorkUnit[]>;
  getById(id: number): Promise<Result<WorkUnit, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedWorkUnit[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedWorkUnit, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedWorkUnit>>;
  listBranches(): Promise<readonly WorkUnit[]>;
  listDirectorates(): Promise<readonly WorkUnit[]>;
  listLocalizedBranches(language: Language): Promise<readonly LocalizedWorkUnit[]>;
  listLocalizedDirectorates(language: Language): Promise<readonly LocalizedWorkUnit[]>;
  getDirectoratesByBranch(branchId: number): Promise<readonly WorkUnit[]>;
  getLocalizedDirectoratesByBranch(branchId: number, language: Language): Promise<readonly LocalizedWorkUnit[]>;
};

export function getWorkUnitService(): WorkUnitService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockWorkUnitService() : getDefaultWorkUnitService();
}
