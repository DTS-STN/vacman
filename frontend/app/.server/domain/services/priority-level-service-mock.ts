import type { PriorityLevel, LocalizedPriorityLevel } from '~/.server/domain/models';
import type { PriorityLevelService } from '~/.server/domain/services/priority-level-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import priorityLevelData from '~/.server/resources/priorityLevel.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: PriorityLevel[] = priorityLevelData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<PriorityLevel>(
  transformedData,
  'priority level',
  ErrorCodes.NO_PRIORITY_LEVEL_FOUND,
);

export function getMockPriorityLevelService(): PriorityLevelService {
  return {
    listAll(): Promise<readonly PriorityLevel[]> {
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

    listAllLocalized(language: Language): Promise<readonly LocalizedPriorityLevel[]> {
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
