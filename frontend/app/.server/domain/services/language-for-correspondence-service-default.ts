import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

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
     * @returns An array of language of correspondence objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly LanguageOfCorrespondence[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languagesOfCorrespondance`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Languages of Correspondance. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: LanguageOfCorrespondence[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Languages of Correspondance: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single language of correspondence by its ID.
     *
     * @param id The ID of the language of correspondence to retrieve.
     * @returns The language of correspondence object if found or {AppError} If the language of correspondence is not found or if the request fails or if the server responds with an error status.
     */
    async getById(id: string): Promise<Result<LanguageOfCorrespondence, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/languagesOfCorrespondance/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(
            new AppError(
              `Language of Correspondance with ID '${id}' not found.`,
              ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
            ),
          );
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Language of Correspondance with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: LanguageOfCorrespondence = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Language of Correspondance by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single language of correspondence by its ID.
     *
     * @param id The ID of the language of correspondence to retrieve.
     * @returns The language of correspondence object if found or undefined if not found.
     */

    async findById(id: string): Promise<Option<LanguageOfCorrespondence>> {
      const result = await getDefaultLanguageForCorrespondenceService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((languageOfCorrespondence) => languageOfCorrespondence.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a list of languages of correspondence localized to the specified language.
     *
     * @param language The language to localize the language names to.
     * @returns An array of localized language of correspondence objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedLanguageOfCorrespondence[], AppError>> {
      const result = await getDefaultLanguageForCorrespondenceService().getAll();

      return result.map((languagesOfCorrespondence) =>
        languagesOfCorrespondence.map((languageOfCorrespondence) => ({
          id: languageOfCorrespondence.id,
          name: language === 'fr' ? languageOfCorrespondence.nameFr : languageOfCorrespondence.nameEn,
        })),
      );
    },

    /**
     * Retrieves a single localized language of correspondence by its ID.
     *
     * @param id The ID of the localized language of correspondence to retrieve.
     * @param language The language to localize the language names to.
     * @returns The localized language of correspondence object if found or {AppError} If the language of correspondence is not found or if the request fails or if the server responds with an error status.
     */
    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>> {
      const result = await getDefaultLanguageForCorrespondenceService().getById(id);

      return result.map((languageOfCorrespondence) => ({
        id: languageOfCorrespondence.id,
        name: language === 'fr' ? languageOfCorrespondence.nameFr : languageOfCorrespondence.nameEn,
      }));
    },
  };
}
