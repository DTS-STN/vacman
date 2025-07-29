import type { ProfileStatusService } from './profile-status-service';

import type { LocalizedStatus, ProfileStatus } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';

// Centralized localization logic
function localizedStatus(status: ProfileStatus, language: Language): LocalizedStatus {
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
    const response = await apiClient.get<ApiResponse>('/profile-status', context);

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
  async listAllLocalized(language: Language): Promise<readonly LocalizedStatus[]> {
    const profileStatus = await this.listAll();
    return profileStatus.map((status) => localizedStatus(status, language));
  },
};

export function getDefaultProfileStatusService(): ProfileStatusService {
  return profileStatusService;
}
