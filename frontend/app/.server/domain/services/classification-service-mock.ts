import type { Classification, LocalizedClassification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import esdcClassificationData from '~/.server/resources/classification.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: Classification[] = esdcClassificationData.content.map((classification) => ({
  id: classification.id.toString(),
  code: classification.name,
  nameEn: classification.name,
  nameFr: classification.name,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<Classification>(
  transformedData,
  'classification',
  ErrorCodes.NO_CLASSIFICATION_FOUND,
);

export function getMockClassificationService(): ClassificationService {
  return {
    listAll(): Promise<readonly Classification[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: string) {
      return Promise.resolve(sharedService.getById(id));
    },

    getByCode(code: string) {
      return Promise.resolve(sharedService.getByCode(code));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedClassification[]> {
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
