import type { Result, Option } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import { getDefaultEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service-default';
import { getMockEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type EmploymentTenureService = {
  getAll(): Promise<Result<readonly EmploymentTenure[], AppError>>;
  getById(id: string): Promise<Result<EmploymentTenure, AppError>>;
  findById(id: string): Promise<Option<EmploymentTenure>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedEmploymentTenure[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>>;
};

export function getEmploymentTenureService(): EmploymentTenureService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEmploymentTenureService()
    : getDefaultEmploymentTenureService();
}
