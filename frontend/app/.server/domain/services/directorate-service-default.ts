import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { createCustomLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
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

// Create a single instance of the service using shared implementation with custom localization
const sharedService = createCustomLookupService<Directorate, LocalizedDirectorate>(
  '/codes/work-units',
  'directorate',
  ErrorCodes.NO_DIRECTORATE_FOUND,
  localizeDirectorate,
);

// Create a single instance of the service (Singleton)
export const directorateService: DirectorateService = sharedService;

/**
 * Returns the default directorate service instance.
 */
export function getDefaultDirectorateService(): DirectorateService {
  return directorateService;
}
