import type { WFAStatus } from '~/.server/domain/models';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import wfaStatusData from '~/.server/resources/currentWFAStatus.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: WFAStatus[] = wfaStatusData.content.map((status) => ({
  id: status.id,
  code: status.code,
  nameEn: status.nameEn,
  nameFr: status.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<WFAStatus>(mockData, 'wfa status', ErrorCodes.NO_WFA_STATUS_FOUND);

export function getMockWFAStatusService(): WFAStatusService {
  return {
    listAll(): Promise<readonly WFAStatus[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
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
