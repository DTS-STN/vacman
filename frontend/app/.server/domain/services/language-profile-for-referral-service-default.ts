import type { LanguageProfileForReferral, LocalizedLanguageProfileForReferral } from '~/.server/domain/models';
import type { LanguageProfileForReferralService } from '~/.server/domain/services/language-profile-for-referral-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultLanguageProfileForReferral(): LanguageProfileForReferralService {
  return {
    /**
     * Retrieves a list of languages profile for referral.
     *
     * @returns An array of language profile for referral objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLanguagesProfileForReferral(): Promise<readonly LanguageProfileForReferral[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languages`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Languages. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single languages profile for referral by its ID.
     *
     * @param id The ID of the languages profile for referral to retrieve.
     * @returns The languages profile for referral object if found.
     * @throws AppError If the languages profile for referral is not found or if the request fails or if the server responds with an error status.
     */
    async getLanguageProfileForReferralById(id): Promise<LanguageProfileForReferral | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languages/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Language with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a list of languages profile for referral localized to the specified language.
     *
     * @param language The language to localize the language names to.
     * @returns An array of localized languages profile for referral objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedLanguageProfileForReferral(language): Promise<readonly LocalizedLanguageProfileForReferral[]> {
      const response = await getDefaultLanguageProfileForReferral().getLanguagesProfileForReferral();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },

    /**
     * Retrieves a single localized languages profile for referral by its ID.
     *
     * @param id The ID of the languages profile for referral to retrieve.
     * @param language The language to localize the language name to.
     * @returns The localized languages profile for referral object if found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedLanguageProfileForReferralById(id, language): Promise<LocalizedLanguageProfileForReferral | undefined> {
      const response = await getDefaultLanguageProfileForReferral().getLocalizedLanguageProfileForReferral(language);
      return response.find((l) => l.id === id);
    },
  };
}
