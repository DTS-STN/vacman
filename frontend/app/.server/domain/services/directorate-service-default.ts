import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { LocalizedDirectorate, Directorate, Branch } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeDirectorate(directorate: Directorate, language: Language): LocalizedDirectorate {
  return {
    id: directorate.id,
    code: directorate.code,
    name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
    parent: {
      id: directorate.parent.id,
      code: directorate.parent.code,
      name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
    },
  };
}

// Helper to convert API WorkUnit object to Branch
function toBranch(obj: Branch): Branch {
  return {
    id: obj.id.toString(),
    code: obj.code,
    nameEn: obj.nameEn,
    nameFr: obj.nameFr,
  };
}
// Helper to convert API WorkUnit object to Directorate
function toDirectorate(obj: Directorate): Directorate {
  return {
    id: obj.id.toString(),
    code: obj.code,
    nameEn: obj.nameEn,
    nameFr: obj.nameFr,
    parent: toBranch(obj.parent),
  };
}

// Create a single instance of the service (Singleton)
export const directorateService: DirectorateService = {
  /**
   * Retrieves a list of all esdc directorates.
   *
   * @returns A promise that resolves to an array of esdc directorate objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly Directorate[]> {
    type ApiResponse = {
      content: readonly Directorate[];
    };
    const context = 'list all esdc directorates';
    const response = await apiClient.get<ApiResponse>('/codes/work-units', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    // Directorates: items WITH a parent property
    return data.content.filter((c) => 'parent' in c).map(toDirectorate);
  },

  /**
   * Retrieves a single esdc directorate by its ID.
   *
   * @param id The ID of the esdc directorate to retrieve.
   * @returns A `Result` containing the esdc directorate object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<Directorate, AppError>> {
    const context = `Get ESDC Directorate with ID '${id}'`;
    const response = await apiClient.get<Directorate>(`/codes/work-units/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single esdc branches by its CODE.
    
  },

  /**
   * Retrieves a single esdc directorate by its CODE.
   *
   * @param code The CODE of the esdc directorate to retrieve.
   * @returns A `Result` containing the esdc directorate object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<Directorate, AppError>> {
    const context = `esdc directorate with CODE '${code}'`;
    type ApiResponse = {
      content: readonly Directorate[];
    };
    const response = await apiClient.get<ApiResponse>(`/codes/work-units?code=${code}`, context);
    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const directorate = data.content[0]; // Get the first element from the response array

    if (!directorate) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`'${context} not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
    }

    return Ok(directorate);
  },

  // Localized methods

  /**
   * Retrieves a list of all esdc directorates, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized esdc directorate objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedDirectorate[]> {
    const directorates = await this.listAll();
    return directorates.map((directorate) => localizeDirectorate(directorate, language));
  },

  /**
   * Retrieves a single localized esdc directorate by its ID.
   *
   * @param id The ID of the esdc directorate to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized esdc directorate object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>> {
    const result = await this.getById(id);
    return result.map((directorate) => localizeDirectorate(directorate, language));
  },

  /**
   * Retrieves a single localized esdc directorate by its CODE.
   *
   * @param code The CODE of the esdc directorate to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized esdc directorate object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>> {
    const result = await this.getByCode(code);
    return result.map((directorate) => localizeDirectorate(directorate, language));
  },

  /**
   * Finds a single localized esdc directorate by its ID.
   *
   * @param id The ID of the esdc directorate to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized esdc directorate object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedDirectorate>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized esdc directorate by its CODE.
   *
   * @param code The CODE of the esdc directorate to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized esdc directorate object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedDirectorate>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultDirectorateService(): DirectorateService {
  return directorateService;
}
