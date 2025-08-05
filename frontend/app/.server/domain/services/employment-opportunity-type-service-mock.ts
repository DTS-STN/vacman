import type { EmploymentOpportunityType, LocalizedEmploymentOpportunityType } from '~/.server/domain/models';
import type { EmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import employmentOpportunityTypeData from '~/.server/resources/employmentOpportunityType.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: EmploymentOpportunityType[] = employmentOpportunityTypeData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<EmploymentOpportunityType>(
  transformedData,
  'employment opportunity type',
  ErrorCodes.NO_EMPLOYMENT_OPPORTUNITY_TYPE_FOUND,
);

export function getMockEmploymentOpportunityTypeService(): EmploymentOpportunityTypeService {
  return {
    listAll(): Promise<readonly EmploymentOpportunityType[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentOpportunityType[]> {
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
