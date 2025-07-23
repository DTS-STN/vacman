import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { LocalizedWFAStatus, WFAStatus } from '~/.server/domain/models';
import { apiFetch } from '~/.server/domain/services/api-client';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Centralized localization logic
function localizeWFAStatus(wfaStatus: WFAStatus, language: Language): LocalizedWFAStatus {
  return {
    id: wfaStatus.id,
    code: wfaStatus.code,
    name: language === 'fr' ? wfaStatus.nameFr : wfaStatus.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const wfaStatusService: WFAStatusService = {
  /**
   * Retrieves a list of all wfa statuses.
   *
   * @returns A promise that resolves to an array of  wfa status objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly WFAStatus[]> {
    type ApiResponse = {
      content: readonly WFAStatus[];
    };
    const context = 'list all wfa statuses';
    const response = await apiFetch('/wfa-statuses', context);

    const data: ApiResponse = await response.json();
    return data.content;
  },

  /**
   * Retrieves a single  wfa statuses by its ID.
   *
   * @param id The ID of the  wfa statuses to retrieve.
   * @returns A `Result` containing the  wfa statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<WFAStatus, AppError>> {
    const context = `get wfa statuses with ID '${id}'`;
    try {
      const response = await apiFetch(`/work-units/${id}`, context);
      const data: WFAStatus = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.errorCode === ErrorCodes.VACMAN_API_ERROR) {
        return Err(new AppError(`${error.message}`, ErrorCodes.NO_WFA_STATUS_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
  },

  /**
   * Retrieves a single wfa statuses by its CODE.
   *
   * @param code The CODE of the wfa statuses to retrieve.
   * @returns A `Result` containing the wfa statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<WFAStatus, AppError>> {
    const context = `get wfa statuses with CODE '${code}'`;
    type ApiResponse = {
      content: readonly WFAStatus[];
    };
    const response = await apiFetch(`/wfa-statuses?code=${code}`, context);

    const data: ApiResponse = await response.json();
    const wfaStatus = data.content[0]; // Get the first element from the response array

    if (!wfaStatus) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`WFA Status with CODE '${code}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
    }

    return Ok(wfaStatus);
  },

  // Localized methods

  /**
   * Retrieves a list of all wfa statuses, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized wfa statuses objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedWFAStatus[]> {
    const wfaStatuses = await this.listAll();
    return wfaStatuses.map((status) => localizeWFAStatus(status, language));
  },

  /**
   * Retrieves a single localized wfa statuses by its ID.
   *
   * @param id The ID of the wfa statuses to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized wfa statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>> {
    const result = await this.getById(id);
    return result.map((wfaStatus) => localizeWFAStatus(wfaStatus, language));
  },

  /**
   * Retrieves a single localized wfa statuses by its CODE.
   *
   * @param code The CODE of the wfa statuses to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized wfa statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>> {
    const result = await this.getByCode(code);
    return result.map((wfaStatus) => localizeWFAStatus(wfaStatus, language));
  },

  /**
   * Finds a single localized wfa status by its ID.
   *
   * @param id The ID of the wfa status to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized wfa status object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedWFAStatus>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized wfa status by its CODE.
   *
   * @param code The CODE of the wfa status to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized wfa status object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedWFAStatus>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultWFAStatusService(): WFAStatusService {
  return wfaStatusService;
}
