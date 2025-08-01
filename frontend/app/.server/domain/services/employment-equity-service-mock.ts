import type { EmploymentEquity } from '~/.server/domain/models';
import type { EmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import employmentEquityData from '~/.server/resources/employmentEquity.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: EmploymentEquity[] = employmentEquityData.content.map((employmentEquity) => ({
  id: employmentEquity.id,
  code: employmentEquity.code,
  nameEn: employmentEquity.nameEn,
  nameFr: employmentEquity.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<EmploymentEquity>(
  mockData,
  'employment equity',
  ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND,
);

export function getMockEmploymentEquityService(): EmploymentEquityService {
  return {
    listAll(): Promise<readonly EmploymentEquity[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    getByCode(code: string) {
      return Promise.resolve(sharedService.getByCode(code));
    },

    findByCode(code: string) {
      return Promise.resolve(sharedService.findByCode(code));
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

    getLocalizedByCode(code: string, language: Language) {
      return Promise.resolve(sharedService.getLocalizedByCode(code, language));
    },

    findLocalizedByCode(code: string, language: Language) {
      return Promise.resolve(sharedService.findLocalizedByCode(code, language));
    },
  };
}
