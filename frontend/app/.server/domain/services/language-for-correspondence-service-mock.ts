import type { LanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import esdcLanguageOfCorrespondenceData from '~/.server/resources/preferredLanguageForCorrespondence.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: LanguageOfCorrespondence[] = esdcLanguageOfCorrespondenceData.content.map((option) => ({
  id: option.id.toString(),
  code: option.code,
  nameEn: option.nameEn,
  nameFr: option.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<LanguageOfCorrespondence>(
  mockData,
  'language of correspondence',
  ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
);

export function getMockLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return {
    listAll(): Promise<readonly LanguageOfCorrespondence[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: string) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: string) {
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

    getLocalizedById(id: string, language: Language) {
      return Promise.resolve(sharedService.getLocalizedById(id, language));
    },

    findLocalizedById(id: string, language: Language) {
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
