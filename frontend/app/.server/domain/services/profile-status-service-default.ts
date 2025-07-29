import type { Result, Option } from 'oxide.ts';
import { Err } from 'oxide.ts';

import type { ProfileStatusService } from './profile-status-service';

import type { LocalizedProfileStatus, ProfileStatus } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizedProfileStatus(status: ProfileStatus, language: Language): LocalizedProfileStatus {
  return {
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const profileStatusService: ProfileStatusService = {
  /**
   * Retrieves a list of all status.
   *
   * @returns A promise that resolves to an array of status objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly ProfileStatus[]> {
    type ApiResponse = {
      content: readonly ProfileStatus[];
    };
    const context = 'list all profile status';
    const response = await apiClient.get<ApiResponse>('/codes/profile-statuses', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  // Localized methods

  /**
   * Retrieves a list of all profile status, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized profile status objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedProfileStatus[]> {
    const profileStatus = await this.listAll();
    return profileStatus.map((status) => localizedProfileStatus(status, language));
  },

  /**
   * Retrieves a single  profile statuses by its ID.
   *
   * @param id The ID of the  profile statuses to retrieve.
   * @returns A `Result` containing the  profile statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<ProfileStatus, AppError>> {
    const context = `Get Profile Status with ID '${id}'`;

    const response = await apiClient.get<ProfileStatus>(`/codes/profile-statuses/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_PROFILE_STATUS_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single localized profile statuses by its ID.
   *
   * @param id The ID of the profile statuses to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized profile statuses object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedProfileStatus, AppError>> {
    const result = await this.getById(id);
    return result.map((profileStatus) => localizedProfileStatus(profileStatus, language));
  },

  /**
   * Finds a single localized profile status by its ID.
   *
   * @param id The ID of the profile status to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized profile status object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedProfileStatus>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },
};

export function getDefaultProfileStatusService(): ProfileStatusService {
  return profileStatusService;
}
