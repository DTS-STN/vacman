import type { Result, Option } from 'oxide.ts';

import type { EmploymentOpportunityType, LocalizedEmploymentOpportunityType } from '~/.server/domain/models';
import { getDefaultEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service-default';
import { getMockEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type EmploymentOpportunityTypeService = {
  listAll(): Promise<readonly EmploymentOpportunityType[]>;
  getById(id: number): Promise<Result<EmploymentOpportunityType, AppError>>;
  findById(id: number): Promise<Option<EmploymentOpportunityType>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentOpportunityType[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedEmploymentOpportunityType, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedEmploymentOpportunityType>>;
};

export function getEmploymentOpportunityTypeService(): EmploymentOpportunityTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEmploymentOpportunityTypeService()
    : getDefaultEmploymentOpportunityTypeService();
}
