import type { Result, Option } from 'oxide.ts';

import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import { getDefaultDirectorateService } from '~/.server/domain/services/directorate-service-default';
import { getMockDirectorateService } from '~/.server/domain/services/directorate-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type DirectorateService = {
  getAll(): Promise<Result<readonly Directorate[], AppError>>;
  getById(id: string): Promise<Result<Directorate, AppError>>;
  findById(id: string): Promise<Option<Directorate>>;
  getByCode(code: string): Promise<Result<Directorate, AppError>>;
  findByCode(code: string): Promise<Option<Directorate>>;
  getAllByBranchId(branchId: string): Promise<Result<readonly Directorate[], AppError>>;
  getAllByBranchCode(branchCode: string): Promise<Result<readonly Directorate[], AppError>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedDirectorate[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedDirectorate>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedDirectorate>>;
};

export function getDirectorateService(): DirectorateService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockDirectorateService() : getDefaultDirectorateService();
}
