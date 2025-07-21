import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

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
   * Retrieves a list of all language referral types.
   *
   * @returns A promise that resolves to an array of language referral type objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly LanguageReferralType[]> {
    type ApiResponse = {
      content: readonly LanguageReferralType[];
    };
    const context = 'list all language referral types';
    const response = await apiClient.get<ApiResponse>('/language-referral-types', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @returns A `Result` containing the language referral type object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<LanguageReferralType, AppError>> {
    const context = `Get Language referral type with ID '${id}'`;
    const response = await apiClient.get<LanguageReferralType>(`/language-referral-types/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @returns A `Result` containing the language referral type object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<LanguageReferralType, AppError>> {
    const context = `get language referral type with CODE '${code}'`;
    type ApiResponse = {
      content: readonly LanguageReferralType[];
    };
    const response = await apiClient.get<ApiResponse>(`/language-referral-types?code=${code}`, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const referralLanguage = data.content[0]; // Get the first element from the response array

    if (!referralLanguage) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
    }

    return Ok(referralLanguage);
  },

  /**
   * Finds a single language referral type by its ID.
   *
   * @param id The ID of the language referral type to find.
   * @returns An `Option` containing the language referral type object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findById(id: string): Promise<Option<LanguageReferralType>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts Result<T, E> to Option<T>
  },

  /**
   * Finds a single language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to find.
   * @returns An `Option` containing the language referral type object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findByCode(code: string): Promise<Option<LanguageReferralType>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of all language referral types, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized language referral type objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedLanguageReferralType[]> {
    const languageReferralTypes = await this.listAll();
    return languageReferralTypes.map((type) => localizeLanguageReferralType(type, language));
  },

  /**
   * Retrieves a single localized language referral type by its ID.
   *
   * @param id The ID of the language referral type to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized language referral type object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>> {
    const result = await this.getById(id);
    return result.map((languageReferralType) => localizeLanguageReferralType(languageReferralType, language));
  },

  /**
   * Retrieves a single localized language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized language referral type object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>> {
    const result = await this.getByCode(code);
    return result.map((languageReferralType) => localizeLanguageReferralType(languageReferralType, language));
  },

  /**
   * Finds a single localized language referral type by its ID.
   *
   * @param id The ID of the language referral type to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized language referral type object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedLanguageReferralType>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized language referral type by its CODE.
   *
   * @param code The CODE of the language referral type to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized language referral type object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageReferralType>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultLanguageReferralType(): LanguageReferralTypeService {
  return languageReferralTypeService;
}
