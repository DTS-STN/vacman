import type { LanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import languageReferralTypeData from '~/.server/resources/languageReferralType.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: LanguageReferralType[] = languageReferralTypeData.content.map((language) => ({
  id: language.id,
  code: language.code,
  nameEn: language.nameEn,
  nameFr: language.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<LanguageReferralType>(
  mockData,
  'language referral type',
  ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND,
);

export function getMockLanguageReferralType(): LanguageReferralTypeService {
  return {
    listAll(): Promise<readonly LanguageReferralType[]> {
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
