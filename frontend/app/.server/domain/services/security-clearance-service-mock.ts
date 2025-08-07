import type { SecurityClearance, LocalizedSecurityClearance } from '~/.server/domain/models';
import type { SecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import securityClearanceData from '~/.server/resources/securityClearance.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: SecurityClearance[] = securityClearanceData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<SecurityClearance>(
  transformedData,
  'security clearance',
  ErrorCodes.NO_SECURITY_CLEARANCE_FOUND,
);

export function getMockSecurityClearanceService(): SecurityClearanceService {
  return {
    listAll(): Promise<readonly SecurityClearance[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedSecurityClearance[]> {
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
