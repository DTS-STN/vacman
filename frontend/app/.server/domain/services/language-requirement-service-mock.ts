import type { LanguageRequirement, LocalizedLanguageRequirement } from '~/.server/domain/models';
import type { LanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import languageRequirementData from '~/.server/resources/languageRequirement.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: LanguageRequirement[] = languageRequirementData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<LanguageRequirement>(
  transformedData,
  'language requirement',
  ErrorCodes.NO_LANGUAGE_REQUIREMENT_FOUND,
);

export function getMockLanguageRequirementService(): LanguageRequirementService {
  return {
    listAll(): Promise<readonly LanguageRequirement[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    getByCode(code: string) {
      return Promise.resolve(sharedService.getByCode(code));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    findByCode(code: string) {
      return Promise.resolve(sharedService.findByCode(code));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedLanguageRequirement[]> {
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
