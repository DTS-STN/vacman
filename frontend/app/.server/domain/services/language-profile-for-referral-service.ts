import type { LanguageProfileForReferral, LocalizedLanguageProfileForReferral } from '~/.server/domain/models';
import { getDefaultLanguageProfileForReferral } from '~/.server/domain/services/language-profile-for-referral-service-default';
import { getMockLanguageProfileForReferral } from '~/.server/domain/services/language-profile-for-referral-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type LanguageProfileForReferralService = {
  getLanguagesProfileForReferral(): Promise<readonly LanguageProfileForReferral[]>;
  getLanguageProfileForReferralById(id: string): Promise<LanguageProfileForReferral | undefined>;
  getLocalizedLanguageProfileForReferral(language: Language): Promise<readonly LocalizedLanguageProfileForReferral[]>;
  getLocalizedLanguageProfileForReferralById(
    id: string,
    language: Language,
  ): Promise<LocalizedLanguageProfileForReferral | undefined>;
};

export function getLanguageProfileForReferralService(): LanguageProfileForReferralService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockLanguageProfileForReferral()
    : getDefaultLanguageProfileForReferral();
}
