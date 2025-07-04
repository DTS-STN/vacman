import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized API request logic
async function makeApiRequest<T>(path: string, context: string): Promise<Result<T, AppError>> {
  try {
    const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND));
    }

    if (!response.ok) {
      return Err(
        new AppError(
          `Failed to ${context.toLowerCase()}. Server responded with status ${response.status}.`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }

    // Handle cases where the server returns 204 No Content for a successful empty response
    if (response.status === HttpStatusCodes.NO_CONTENT) {
      return Ok([] as unknown as T); // Return an empty array or appropriate empty value
    }

    const data: T = await response.json();
    return Ok(data);
  } catch (error) {
    return Err(
      new AppError(`Unexpected error occurred while ${context.toLowerCase()}: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
    );
  }
}

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
   * Retrieves a list of languages of correspondence.
   *
   * @returns An array of language of correspondence objects or {AppError} if the request fails or if the server responds with an error status.
   */
  getAll(): Promise<Result<readonly LanguageOfCorrespondence[], AppError>> {
    return makeApiRequest('/languagesOfCorrespondance', 'Retrieve all directorates');
  },

  /**
   * Retrieves a single language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @returns The language of correspondence object if found or {AppError} If the language of correspondence is not found or if the request fails or if the server responds with an error status.
   */
  getById(id: string): Promise<Result<LanguageOfCorrespondence, AppError>> {
    return makeApiRequest(`/languagesOfCorrespondance/${id}`, `Find Language of Correspondance with ID '${id}'`);
  },

  /**
   * Retrieves a single language of correspondence by its CODE.
   *
   * @param code The CODE of the language of correspondence to retrieve.
   * @returns The language of correspondence object if found or {AppError} If the language of correspondence is not found or if the request fails or if the server responds with an error status.
   */
  getByCode(code: string): Promise<Result<LanguageOfCorrespondence, AppError>> {
    return makeApiRequest(`/languagesOfCorrespondance?code=${code}`, `Find Language of Correspondance with CODE '${code}'`);
  },

  /**
   * Retrieves a single language of correspondence by its ID.
   *
   * @param id The ID of the language of correspondence to retrieve.
   * @returns The language of correspondence object if found or undefined if not found.
   */
  async findById(id: string): Promise<Option<LanguageOfCorrespondence>> {
    const result = await this.getById(id);
    // .ok() converts a Result<T, E> into an Option<T>
    return result.ok();
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
   * Retrieves a list of language of correspondence localized to the specified language.
   *
   * @param language The language to localize the branch names to.
   * @returns An array of localized language of correspondence objects or AppError if the request fails or if the server responds with an error status.
   */
  async getAllLocalized(language: Language): Promise<Result<readonly LocalizedLanguageOfCorrespondence[], AppError>> {
    const result = await this.getAll();
    return result.map((languagesOfCorrespondance) =>
      languagesOfCorrespondance.map((languageOfCorrespondance) =>
        localizedLanguageOfCorrespondence(languageOfCorrespondance, language),
      ),
    );
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
    return result.map((languageOfCorrespondance) => localizedLanguageOfCorrespondence(languageOfCorrespondance, language));
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
    return result.map((languageOfCorrespondance) => localizedLanguageOfCorrespondence(languageOfCorrespondance, language));
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
