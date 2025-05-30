import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return {
    /**
     * Retrieves a list of languages of correspondence.
     *
     * @returns An array of language of correspondence objects.
     */
    async getLanguagesOfCorrespondence(): Promise<readonly LanguageOfCorrespondence[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languagesOfCorrespondance`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Languages. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single language of correspondence by its ID.
     *
     * @param id The ID of the language of correspondence to retrieve.
     * @returns The language of correspondence object if found.
     */
    async getLanguageOfCorrespondenceById(id: string): Promise<LanguageOfCorrespondence | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languagesOfCorrespondance/${id}`);

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
     * Retrieves a list of languages of correspondence localized to the specified language.
     *
     * @param language The language to localize the language names to.
     * @returns An array of localized language of correspondence objects.
     */
    async getLocalizedLanguageOfCorrespondence(language: Language): Promise<readonly LocalizedLanguageOfCorrespondence[]> {
      const response = await getDefaultLanguageForCorrespondenceService().getLanguagesOfCorrespondence();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },

    /**
     * Retrieves a single localized language of correspondence by its ID.
     *
     * @param id The ID of the localized language of correspondence to retrieve.
     * @param language The language to localize the language names to.
     * @returns The localized language of correspondence object if found.
     */
    async getLocalizedLanguageOfCorrespondenceById(
      id: string,
      language: Language,
    ): Promise<LocalizedLanguageOfCorrespondence | undefined> {
      const localizedLanguages =
        await getDefaultLanguageForCorrespondenceService().getLocalizedLanguageOfCorrespondence(language);
      const languageOfCorrespondence = localizedLanguages.find((l) => l.id === id);
      if (!languageOfCorrespondence) {
        throw new AppError(
          `Language of correspondence with ID '${id}' not found.`,
          ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
        );
      }
      return languageOfCorrespondence;
    },
  };
}
