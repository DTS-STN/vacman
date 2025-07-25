import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { Classification, LocalizedClassification } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeClassification(classification: Classification, language: Language): LocalizedClassification {
  return {
    id: classification.id,
    code: classification.code,
    name: language === 'fr' ? classification.nameFr : classification.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const classificationService: ClassificationService = {
  /**
   * Retrieves a list of all esdc classification groups and levels.
   *
   * @returns A promise that resolves to an array of esdc classification groups and level objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly Classification[]> {
    type ApiResponse = {
      content: readonly Classification[];
    };
    const context = 'list all esdc classification groups and levels';
    const response = await apiClient.get<ApiResponse>('/classifications', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single esdc classification by its ID.
   *
   * @param id The ID of the esdc classification to retrieve.
   * @returns A `Result` containing the esdc classification object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<Classification, AppError>> {
    const context = `Get Classification with ID '${id}'`;

    const response = await apiClient.get<Classification>(`/classifications/${id}`, context);
    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single esdc classification by its CODE.
   *
   * @param code The CODE of the esdc classification to retrieve.
   * @returns A `Result` containing the esdc classification object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<Classification, AppError>> {
    const context = `get classification with CODE '${code}'`;
    type ApiResponse = {
      content: readonly Classification[];
    };
    const response = await apiClient.get<ApiResponse>(`/classifications?code=${code}`, context);
    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const classification = data.content[0]; // Get the first element from the response array

    if (!classification) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`'${context} not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
    }

    return Ok(classification);
  },

  // Localized methods

  /**
   * Retrieves a list of all classifications, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized classification objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedClassification[]> {
    const classifications = await this.listAll();
    return classifications.map((type) => localizeClassification(type, language));
  },

  /**
   * Retrieves a single localized classificatio by its ID.
   *
   * @param id The ID of the classificatio to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized classificatio object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedClassification, AppError>> {
    const result = await this.getById(id);
    return result.map((classificatio) => localizeClassification(classificatio, language));
  },

  /**
   * Retrieves a single localized classificatio by its CODE.
   *
   * @param code The CODE of the classificatio to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized classificatio object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedClassification, AppError>> {
    const result = await this.getByCode(code);
    return result.map((classificatio) => localizeClassification(classificatio, language));
  },

  /**
   * Finds a single localized classificatio by its ID.
   *
   * @param id The ID of the classificatio to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized classificatio object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedClassification>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized classificatio by its CODE.
   *
   * @param code The CODE of the classificatio to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized classificatio object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedClassification>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultClassificationService(): ClassificationService {
  return classificationService;
}
