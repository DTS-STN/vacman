import type { Result, Option } from 'oxide.ts';

import type { EmploymentEquity, LocalizedEmploymentEquity } from '~/.server/domain/models';
import { getDefaultEmploymentEquityService } from '~/.server/domain/services/employment-equity-service-default';
import { getMockEmploymentEquityService } from '~/.server/domain/services/employment-equity-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type EmploymentEquityService = {
  listAll(): Promise<readonly EmploymentEquity[]>;
  getById(id: number): Promise<Result<EmploymentEquity, AppError>>;
  findById(id: number): Promise<Option<EmploymentEquity>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentEquity[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedEmploymentEquity, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedEmploymentEquity>>;
};

export function getEmploymentEquityService(): EmploymentEquityService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEmploymentEquityService()
    : getDefaultEmploymentEquityService();
}
