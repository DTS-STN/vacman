import type { LanguageRequirement } from '~/.server/domain/models';
import type { LanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<LanguageRequirement>(
  '/codes/language-requirements',
  'language requirement',
  ErrorCodes.NO_LANGUAGE_REQUIREMENT_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const languageRequirementService: LanguageRequirementService = sharedService;

/**
 * Returns the default language requirement service instance.
 */
export function getDefaultLanguageRequirementService(): LanguageRequirementService {
  return languageRequirementService;
}
