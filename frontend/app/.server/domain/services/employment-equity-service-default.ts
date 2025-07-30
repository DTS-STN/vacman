import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { EmploymentEquity, LocalizedEmploymentEquity } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { EmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeEmploymentEquity(employmentEquity: EmploymentEquity, language: Language): LocalizedEmploymentEquity {
  return {
    id: employmentEquity.id,
    code: employmentEquity.code,
    name: language === 'fr' ? employmentEquity.nameFr : employmentEquity.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const employmentEquityService: EmploymentEquityService = {
  /**
   * Retrieves a list of all employment equity codes.
   *
   * @returns A promise that resolves to an array of employment equity objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly EmploymentEquity[]> {
    type ApiResponse = {
      content: readonly EmploymentEquity[];
    };
    const context = 'list all employment equity codes';
    const response = await apiClient.get<ApiResponse>('/codes/employment-equity', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single employment equity by its ID.
   *
   * @param id The ID of the employment equity to retrieve.
   * @returns A `Result` containing the employment equity object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<EmploymentEquity, AppError>> {
    const context = `Get employment equity with ID '${id}'`;
    const response = await apiClient.get<EmploymentEquity>(`/codes/employment-equity/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single employment equity by its CODE.
   *
   * @param code The CODE of the employment equity to retrieve.
   * @returns A `Result` containing the employment equity object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<EmploymentEquity, AppError>> {
    const context = `get employment equity with CODE '${code}'`;
    type ApiResponse = {
      content: readonly EmploymentEquity[];
    };
    const response = await apiClient.get<ApiResponse>(`/codes/employment-equity?code=${code}`, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const employmentEquity = data.content[0]; // Get the first element from the response array

    if (!employmentEquity) {
      return Err(new AppError(`Employment Equity with CODE '${code}' not found.`, ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND));
    }

    return Ok(employmentEquity);
  },

  /**
   * Finds a single employment equity by its ID.
   *
   * @param id The ID of the employment equity to find.
   * @returns An `Option` containing the employment equity object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findById(id: string): Promise<Option<EmploymentEquity>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts Result<T, E> to Option<T>
  },

  /**
   * Finds a single employment equity by its CODE.
   *
   * @param code The CODE of the employment equity to find.
   * @returns An `Option` containing the employment equity object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findByCode(code: string): Promise<Option<EmploymentEquity>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of all employment equity codes, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized employment equity objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedEmploymentEquity[]> {
    const employmentEquities = await this.listAll();
    return employmentEquities.map((employmentEquity) => localizeEmploymentEquity(employmentEquity, language));
  },

  /**
   * Retrieves a single localized employment equity by its ID.
   *
   * @param id The ID of the employment equity to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized employment equity object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEmploymentEquity, AppError>> {
    const result = await this.getById(id);
    return result.map((employmentEquity) => localizeEmploymentEquity(employmentEquity, language));
  },

  /**
   * Retrieves a single localized employment equity by its CODE.
   *
   * @param code The CODE of the employment equity to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized employment equity object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedEmploymentEquity, AppError>> {
    const result = await this.getByCode(code);
    return result.map((employmentEquity) => localizeEmploymentEquity(employmentEquity, language));
  },

  /**
   * Finds a single localized employment equity by its ID.
   *
   * @param id The ID of the employment equity to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized employment equity object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedEmploymentEquity>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized employment equity by its CODE.
   *
   * @param code The CODE of the employment equity to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized employment equity object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedEmploymentEquity>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultEmploymentEquityService(): EmploymentEquityService {
  return employmentEquityService;
}
