import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { LookupServiceImplementation } from '~/.server/domain/services/shared/lookup-service-implementation';
import { ErrorCodes } from '~/errors/error-codes';

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

// Create a custom implementation that filters for items with parent property (directorates)
class DirectorateServiceImplementation extends LookupServiceImplementation<Directorate, LocalizedDirectorate> {
  constructor() {
    super({
      apiEndpoint: '/codes/work-units',
      entityName: 'ESDC Directorates',
      notFoundErrorCode: ErrorCodes.NO_DIRECTORATE_FOUND,
      localizeEntity: localizeDirectorate,
    });
  }

  async listAll(): Promise<readonly Directorate[]> {
    // Get all work units and filter for ones with parent property (directorates)
    const allWorkUnits = await super.listAll();
    return allWorkUnits.filter(
      (workUnit: Directorate & { parent?: unknown }) => 'parent' in workUnit && workUnit.parent !== null,
    );
  }

  async listAllLocalized(language: Language): Promise<readonly LocalizedDirectorate[]> {
    // Get filtered directorates and localize them
    const directorates = await this.listAll();
    return directorates.map((directorate) => localizeDirectorate(directorate, language));
  }
}

// Export a single shared instance
export const directorateService: DirectorateService = new DirectorateServiceImplementation();

/**
 * Returns the default directorate service instance.
 */
export function getDefaultDirectorateService(): DirectorateService {
  return directorateService;
}
