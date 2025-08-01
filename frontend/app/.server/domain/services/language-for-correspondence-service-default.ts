import type { LanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<LanguageOfCorrespondence>(
  '/codes/languages',
  'language of correspondence',
  ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const languageForCorrespondenceService: LanguageForCorrespondenceService = sharedService;

/**
 * Returns the default language for correspondence service instance.
 */
export function getDefaultLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return languageForCorrespondenceService;
}
