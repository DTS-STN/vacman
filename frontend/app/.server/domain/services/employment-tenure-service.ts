import type { Result, Option } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import { getDefaultEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service-default';
import { getMockEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type EmploymentTenureService = {
  listAll(): Promise<readonly EmploymentTenure[]>;
  getById(id: number): Promise<Result<EmploymentTenure, AppError>>;
  getByCode(code: string): Promise<Result<EmploymentTenure, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentTenure[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedEmploymentTenure>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedEmploymentTenure>>;
};

export function getEmploymentTenureService(): EmploymentTenureService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEmploymentTenureService()
    : getDefaultEmploymentTenureService();
}
