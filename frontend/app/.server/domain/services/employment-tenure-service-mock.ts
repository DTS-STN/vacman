import type { EmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import employmentTenureData from '~/.server/resources/employmentTenure.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: EmploymentTenure[] = employmentTenureData.content.map((employmentTenure) => ({
  id: employmentTenure.id,
  code: employmentTenure.code,
  nameEn: employmentTenure.nameEn,
  nameFr: employmentTenure.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<EmploymentTenure>(
  mockData,
  'employment tenure',
  ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND,
);

export function getMockEmploymentTenureService(): EmploymentTenureService {
  return {
    listAll(): Promise<readonly EmploymentTenure[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    listAllLocalized(language: Language) {
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
