import type { LanguageProfileForReferral, LocalizedLanguageProfileForReferral } from '~/.server/domain/models';
import type { LanguageProfileForReferralService } from '~/.server/domain/services/language-profile-for-referral-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultLanguageProfileForReferral(): LanguageProfileForReferralService {
  return {
    async getLanguagesProfileForReferral(): Promise<readonly LanguageProfileForReferral[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languages`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Languages. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
    async getLanguageProfileForReferralById(id): Promise<LanguageProfileForReferral | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languages/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Language with ID. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
    async getLocalizedLanguageProfileForReferral(language): Promise<readonly LocalizedLanguageProfileForReferral[]> {
      const response = await getDefaultLanguageProfileForReferral().getLanguagesProfileForReferral();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },
    async getLocalizedLanguageProfileForReferralById(id, language): Promise<LocalizedLanguageProfileForReferral | undefined> {
      const response = await getDefaultLanguageProfileForReferral().getLocalizedLanguageProfileForReferral(language);
      return response.find((l) => l.id === id);
    },
  };
}
