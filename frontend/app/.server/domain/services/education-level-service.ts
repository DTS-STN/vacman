import type { Result, Option } from 'oxide.ts';

import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import { getDefaultEducationLevelService } from '~/.server/domain/services/education-level-service-default';
import { getMockEducationLevelService } from '~/.server/domain/services/education-level-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type EducationLevelService = {
  getAll(): Promise<Result<readonly EducationLevel[], AppError>>;
  getById(id: string): Promise<Result<EducationLevel, AppError>>;
  findById(id: string): Promise<Option<EducationLevel>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedEducationLevel[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEducationLevel, AppError>>;
};

export function getEducationLevelService(): EducationLevelService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEducationLevelService()
    : getDefaultEducationLevelService();
}
