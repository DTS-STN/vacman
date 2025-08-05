import type { ProfileStatus } from '~/.server/domain/models';
import type { ProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import profileStatusData from '~/.server/resources/profileStatus.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: ProfileStatus[] = (profileStatusData.content as ProfileStatus[]).map((status) => ({
  id: status.id,
  code: status.code,
  nameEn: status.nameEn,
  nameFr: status.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<ProfileStatus>(mockData, 'profile status', ErrorCodes.NO_PROFILE_STATUS_FOUND);

export function getMockProfileStatusService(): ProfileStatusService {
  return {
    listAll(): Promise<readonly ProfileStatus[]> {
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
