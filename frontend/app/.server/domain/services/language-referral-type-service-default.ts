import type { LanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<LanguageReferralType>(
  '/codes/language-referral-types',
  'language referral type',
  ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const languageReferralTypeService: LanguageReferralTypeService = sharedService;

/**
 * Returns the default language referral type service instance.
 */
export function getDefaultLanguageReferralTypeService(): LanguageReferralTypeService {
  return languageReferralTypeService;
}
