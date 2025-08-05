import type { Directorate, HierarchicalLookupModel, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { createCustomMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import workUnitData from '~/.server/resources/workUnit.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format and filter for directorates (items with parent)
const mockData: Directorate[] = (workUnitData.content as HierarchicalLookupModel[])
  .filter((workUnit) => workUnit.parent !== null)
  .map((directorate) => ({
    id: directorate.id,
    code: directorate.code,
    nameEn: directorate.nameEn,
    nameFr: directorate.nameFr,
    parent: directorate.parent
      ? {
          id: directorate.parent.id,
          code: directorate.parent.code,
          nameEn: directorate.parent.nameEn,
          nameFr: directorate.parent.nameFr,
        }
      : null,
  }));

// Centralized localization logic
function localizeDirectorate(directorate: Directorate, language: Language): LocalizedDirectorate {
  return {
    id: directorate.id,
    code: directorate.code,
    name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
    parent: directorate.parent
      ? {
          id: directorate.parent.id,
          code: directorate.parent.code,
          name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
        }
      : null,
  };
}

// Create a single instance of the service using shared implementation with custom localization
const sharedService = createCustomMockLookupService<Directorate, LocalizedDirectorate>(
  mockData,
  'directorate',
  ErrorCodes.NO_DIRECTORATE_FOUND,
  localizeDirectorate,
);

export function getMockDirectorateService(): DirectorateService {
  return {
    listAll(): Promise<readonly Directorate[]> {
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
