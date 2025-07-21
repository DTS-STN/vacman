import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { apiFetch } from '~/.server/domain/services/make-api-request';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeEmploymentTenure(employmentTenure: EmploymentTenure, language: Language): LocalizedEmploymentTenure {
  return {
    id: employmentTenure.id,
    code: employmentTenure.code,
    name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const employmentTenureService: EmploymentTenureService = {
  /**
   * Retrieves a list of all employment tenures.
   *
   * @returns A promise that resolves to an array of employment tenures objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly EmploymentTenure[]> {
    type ApiResponse = {
      content: readonly EmploymentTenure[];
    };
    const context = 'list all employment tenures';
    const response = await apiFetch('/employment-tenures', context);

    const data: ApiResponse = await response.json();
    return data.content;
  },

  /**
   * Retrieves a single employment tenure by its ID.
   *
   * @param id The ID of the employment tenure to retrieve.
   * @returns A `Result` containing the employment tenure object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<EmploymentTenure, AppError>> {
    const context = `get employment tenure with ID '${id}'`;
    try {
      const response = await apiFetch(`/employment-tenures/${id}`, context);
      const data: EmploymentTenure = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`Employment tenure with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
  },

  /**
   * Retrieves a single employment tenure by its CODE.
   *
   * @param code The CODE of the employment tenure to retrieve.
   * @returns A `Result` containing the employment tenure object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<EmploymentTenure, AppError>> {
    const context = `get employment tenure with CODE '${code}'`;
    try {
      const response = await apiFetch(`/employment-tenures?code=${code}`, context);
      const data: EmploymentTenure = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`Employment tenure with CODE '${code}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
  },

  // Localized methods

  /**
   * Retrieves a list of all employment tenures, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized employment tenure objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentTenure[]> {
    const employmentTenures = await this.listAll();
    return employmentTenures.map((type) => localizeEmploymentTenure(type, language));
  },

  /**
   * Retrieves a single localized employment tenure by its ID.
   *
   * @param id The ID of the employment tenure to retrieve.
   * @param language The language to localize the employment tenure name to.
   * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found or if the request fails or if the server responds with an error status.
   */

  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>> {
    const result = await this.getById(id);
    return result.map((employmentTenure) => localizeEmploymentTenure(employmentTenure, language));
  },

  /**
   * Retrieves a single localized employment tenure by its CODE.
   *
   * @param code The CODE of the employment tenure to retrieve.
   * @param language The language to localize the employment tenure name to.
   * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found or if the request fails or if the server responds with an error status.
   */

  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>> {
    const result = await this.getByCode(code);
    return result.map((employmentTenure) => localizeEmploymentTenure(employmentTenure, language));
  },

  /**
   * Finds a single localized employment tenure by its ID.
   *
   * @param id The ID of the employment tenure to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized employment tenure object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedEmploymentTenure>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized employment tenure by its CODE.
   *
   * @param code The CODE of the employment tenure to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized employment tenure object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedEmploymentTenure>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultEmploymentTenureService(): EmploymentTenureService {
  return employmentTenureService;
}
