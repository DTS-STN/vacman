import type { UserType, LocalizedUserType } from '~/.server/domain/models';
import type { UserTypeService } from '~/.server/domain/services/user-type-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import userTypeData from '~/.server/resources/userType.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: UserType[] = userTypeData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<UserType>(
  transformedData,
  'user type',
  ErrorCodes.NO_USER_TYPE_FOUND,
);

export function getMockUserTypeService(): UserTypeService {
  return {
    listAll(): Promise<readonly UserType[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedUserType[]> {
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
