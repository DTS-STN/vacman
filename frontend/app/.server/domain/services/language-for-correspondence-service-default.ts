import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizedLanguageOfCorrespondence(
  languageOfCorrespondence: LanguageOfCorrespondence,
  language: Language,
): LocalizedLanguageOfCorrespondence {
  return {
    id: languageOfCorrespondence.id,
    code: languageOfCorrespondence.code,
    name: language === 'fr' ? languageOfCorrespondence.nameFr : languageOfCorrespondence.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const languageForCorrespondenceService: LanguageForCorrespondenceService = {
  /**
   * Retrieves a list of all languages of correspondence.
   *
   * @returns A promise that resolves to an array of languages of correspondence objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly LanguageOfCorrespondence[]> {
    type ApiResponse = {
      content: readonly LanguageOfCorrespondence[];
    };
    const context = 'list all language of correspondence';
    const response = await apiClient.get<ApiResponse>('/languages', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @returns A `Result` containing the language of correspondence object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<LanguageOfCorrespondence, AppError>> {
    const context = `Get Language of correspondence with ID '${id}'`;

    const response = await apiClient.get<LanguageOfCorrespondence>(`/languages/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single language of correspondence by its CODE.
   *
   * @param code The CODE of the language of correspondence to retrieve.
   * @returns A `Result` containing the language of correspondence object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<LanguageOfCorrespondence, AppError>> {
    const context = `get Language of Correspondence with CODE '${code}'`;
    type ApiResponse = {
      content: readonly LanguageOfCorrespondence[];
    };
    const response = await apiClient.get<ApiResponse>(`/languages?code=${code}`, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const correspondenceLanguage = data.content[0]; // Get the first element from the response array

    if (!correspondenceLanguage) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND));
    }

    return Ok(correspondenceLanguage);
  },

  /**
   * Retrieves a single language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @returns The language of correspondence object if found or undefined if not found.
   */
  async findById(id: string): Promise<Option<LanguageOfCorrespondence>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts a Result<T, E> into an Option<T>
  },

  /**
   * Retrieves a single language of correspondence by its CODE.
   *
   * @param code The CODE of the language of correspondence to retrieve.
   * @returns The language of correspondence object if found or undefined If the language of correspondence is not found or if the request fails or if the server responds with an error status.
   */
  async findByCode(code: string): Promise<Option<LanguageOfCorrespondence>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of all language of correspondence, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized language of correspondence objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedLanguageOfCorrespondence[]> {
    const languagesOfCorrespondence = await this.listAll();
    return languagesOfCorrespondence.map((type) => localizedLanguageOfCorrespondence(type, language));
  },

  /**
   * Retrieves a single localized language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @param language The language to localize the language of correspondence name to.
   * @returns The localized language of correspondence object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>> {
    const result = await this.getById(id);
    return result.map((languageOfCorrespondence) => localizedLanguageOfCorrespondence(languageOfCorrespondence, language));
  },

  /**
   * Retrieves a single localized language of correspondence by its ID.
   *
   * @param code The CODE of the language of correspondence to retrieve.
   * @param language The language to localize the language of correspondence name to.
   * @returns The localized language of correspondence object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>> {
    const result = await this.getByCode(code);
    return result.map((languageOfCorrespondence) => localizedLanguageOfCorrespondence(languageOfCorrespondence, language));
  },

  /**
   * Retrieves a single localized language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @param language The language to localize the language of correspondence name to.
   * @returns The localized language of correspondence object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedLanguageOfCorrespondence>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Retrieves a single localized language of correspondence by its ID.
   *
   * @param code The CODE of the language of correspondence to retrieve.
   * @param language The language to localize the language of correspondence name to.
   * @returns The localized language of correspondence object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageOfCorrespondence>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return languageForCorrespondenceService;
}
