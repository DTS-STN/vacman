import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized API request logic
async function makeApiRequest<T>(path: string, context: string): Promise<Result<T, AppError>> {
  try {
    const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
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

// Create a single instance of the service (Singleton)
export const directorateService: DirectorateService = {
  /**
   * Retrieves a list of all esdc directorates.
   *
   * @returns An array of esdc directorate objects or AppError if the request fails or if the server responds with an error status.
   */
  getAll(): Promise<Result<readonly Directorate[], AppError>> {
    return makeApiRequest('/directorates', 'Retrieve all directorates');
  },

  /**
   * Retrieves a single directorate by its ID.
   *
   * @param id The ID of the directorate to retrieve.
   * @returns The directorate object if found or {AppError} If the directorate is not found or if the request fails or if the server responds with an error status.
   */
  getById(id: string): Promise<Result<Directorate, AppError>> {
    return makeApiRequest(`/directorates/${id}`, `Find directorate with ID '${id}'`);
  },

  /**
   * Retrieves a single directorate by its CODE.
   *
   * @param code The CODE of the directorate to retrieve.
   * @returns The directorate object if found or {AppError} If the directorate is not found or if the request fails or if the server responds with an error status.
   */
  getByCode(code: string): Promise<Result<Directorate, AppError>> {
    return makeApiRequest(`/directorates?code=${code}`, `Find directorate with CODE '${code}'`);
  },

  /**
   * Retrieves a list of all esdc directorates by Branch id.
   *
   * @param branchId The ID of the Branch to retrieve directorates.
   * @returns An array of esdc directorate objects or AppError if the request fails or if the server responds with an error status.
   */
  getAllByBranchId(branchId: string): Promise<Result<readonly Directorate[], AppError>> {
    return makeApiRequest(`/directorates?branchId=${branchId}`, `Retrieve directorates for branch ID '${branchId}'`);
  },

  /**
   * Retrieves a list of all esdc directorates by Branch id.
   *
   * @param branchCode The CODE of the Branch to retrieve directorates.
   * @returns An array of esdc directorate objects or AppError if the request fails or if the server responds with an error status.
   */
  getAllByBranchCode(branchCode: string): Promise<Result<readonly Directorate[], AppError>> {
    return makeApiRequest(`/directorates?branchCode=${branchCode}`, `Retrieve directorates for branche CODE '${branchCode}'`);
  },

  /**
   * Retrieves a single directorate by its ID.
   *
   * @param id The ID of the directorate to retrieve.
   * @returns The directorate object if found or undefined If the directorate is not found or if the request fails or if the server responds with an error status.
   */
  async findById(id: string): Promise<Option<Directorate>> {
    const result = await this.getById(id);
    // .ok() converts a Result<T, E> into an Option<T>
    return result.ok();
  },

  /**
   * Retrieves a single directorate by its CODE.
   *
   * @param code The CODE of the directorate to retrieve.
   * @returns The directorate object if found or undefined If the directorate is not found or if the request fails or if the server responds with an error status.
   */
  async findByCode(code: string): Promise<Option<Directorate>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of directorates localized to the specified language.
   *
   * @param language The language to localize the branch names to.
   * @returns An array of localized branch objects or AppError if the request fails or if the server responds with an error status.
   */
  async getAllLocalized(language: Language): Promise<Result<readonly LocalizedDirectorate[], AppError>> {
    const result = await this.getAll();
    return result.map((directorates) => directorates.map((directorate) => localizeDirectorate(directorate, language)));
  },

  /**
   * Retrieves a single localized directorate by its ID.
   *
   * @param id The ID of the directorate to retrieve.
   * @param language The language to localize the directorate name to.
   * @returns The localized directorate object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>> {
    const result = await this.getById(id);
    return result.map((directorate) => localizeDirectorate(directorate, language));
  },

  /**
   * Retrieves a single localized directorate by its ID.
   *
   * @param code The CODE of the directorate to retrieve.
   * @param language The language to localize the directorate name to.
   * @returns The localized directorate object if found or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedDirectorate, AppError>> {
    const result = await this.getByCode(code);
    return result.map((directorate) => localizeDirectorate(directorate, language));
  },

  /**
   * Retrieves a single localized directorate by its ID.
   *
   * @param id The ID of the directorate to retrieve.
   * @param language The language to localize the directorate name to.
   * @returns The localized directorate object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedDirectorate>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Retrieves a single localized directorate by its ID.
   *
   * @param code The CODE of the directorate to retrieve.
   * @param language The language to localize the directorate name to.
   * @returns The localized directorate object if found or undefined if the request fails or if the server responds with an error status.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedDirectorate>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultDirectorateService(): DirectorateService {
  return directorateService;
}
