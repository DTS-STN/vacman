import type { RequestStatus, LocalizedRequestStatus } from '~/.server/domain/models';
import type { RequestStatusService } from '~/.server/domain/services/request-status-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import requestStatusData from '~/.server/resources/requestStatus.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: RequestStatus[] = requestStatusData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<RequestStatus>(
  transformedData,
  'request status',
  ErrorCodes.NO_REQUEST_STATUS_FOUND,
);

export function getMockRequestStatusService(): RequestStatusService {
  return {
    listAll(): Promise<readonly RequestStatus[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedRequestStatus[]> {
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
