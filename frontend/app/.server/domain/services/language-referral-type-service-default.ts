import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized API request logic
async function makeApiRequest<T>(path: string, context: string): Promise<Result<T, AppError>> {
  try {
    const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
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
function localizeLanguageReferralType(
  languageReferralType: LanguageReferralType,
  language: Language,
): LocalizedLanguageReferralType {
  return {
    id: languageReferralType.id,
    code: languageReferralType.code,
    name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const languageReferralTypeService: LanguageReferralTypeService = {
  /**
   * Retrieves a list of language referral types.
   *
   * @returns An array of language referral type objects or {AppError} if the request fails or if the server responds with an error status.
   */
  getAll(): Promise<Result<readonly LanguageReferralType[], AppError>> {
    return makeApiRequest('/language-referral-types', 'Retrieve all Language referral types');
  },

  /**
   * Retrieves a single language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @returns The language referral type object if found or {AppError} If the language referral type is not found or if the request fails or if the server responds with an error status.
   */
  getById(id: string): Promise<Result<LanguageReferralType, AppError>> {
    return makeApiRequest(`/language-referral-types/${id}`, `Find Language referral types with ID '${id}'`);
  },

  /**
   * Retrieves a single language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @returns The language referral type object if found or {AppError} If the language referral type is not found or if the request fails or if the server responds with an error status.
   */
  getByCode(code: string): Promise<Result<LanguageReferralType, AppError>> {
    return makeApiRequest(`/language-referral-types?code=${code}`, `Find Language referral types with CODE '${code}'`);
  },

  /**
   * Retrieves a single language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @returns The language referral type object if found or undefined If the language referral type is not found or if the request fails or if the server responds with an error status.
   */
  async findById(id: string): Promise<Option<LanguageReferralType>> {
    const result = await this.getById(id);
    // .ok() converts a Result<T, E> into an Option<T>
    return result.ok();
  },

  /**
   * Retrieves a single language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @returns The language referral type object if found or undefined If the language referral type is not found or if the request fails or if the server responds with an error status.
   */
  async findByCode(code: string): Promise<Option<LanguageReferralType>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of language referral type localized to the specified language.
   *
   * @param language The language to localize the language referral type names to.
   * @returns An array of localized language referral type objects or AppError if the request fails or if the server responds with an error status.
   */
  async getAllLocalized(language: Language): Promise<Result<readonly LocalizedLanguageReferralType[], AppError>> {
    const result = await this.getAll();
    return result.map((languages) =>
      languages.map((languageReferralType) => localizeLanguageReferralType(languageReferralType, language)),
    );
  },

  /**
   * Retrieves a single localized language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @param language The language to localize the language referral type name to.
   * @returns The localized language referral type object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>> {
    const result = await this.getById(id);
    return result.map((languageReferralType) => localizeLanguageReferralType(languageReferralType, language));
  },

  /**
   * Retrieves a single localized language referral type by its ID.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @param language The language to localize the language referral type name to.
   * @returns The localized language referral type object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>> {
    const result = await this.getByCode(code);
    return result.map((languageReferralType) => localizeLanguageReferralType(languageReferralType, language));
  },

  /**
   * Retrieves a single localized language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @param language The language to localize the language referral type name to.
   * @returns The localized language referral type object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedLanguageReferralType>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Retrieves a single localized language referral type by its ID.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @param language The language to localize the language referral type name to.
   * @returns The localized language referral type object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageReferralType>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultLanguageReferralType(): LanguageReferralTypeService {
  return languageReferralTypeService;
}
