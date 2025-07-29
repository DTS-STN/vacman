import type { LocalizedStatus, ProfileStatus } from '~/.server/domain/models';
import type { ProfileStatusService } from '~/.server/domain/services/profile-status-service';
import profileStatusData from '~/.server/resources/profileStatus.json';

export function getMockProfileStatusService(): ProfileStatusService {
  return {
    listAll: () => Promise.resolve(listAll()),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
  };
}

/**
 * Retrieves a list of all statuses.
 *
 * @returns A promise that resolves to an array of status objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): ProfileStatus[] {
  const profileStatuses: ProfileStatus[] = profileStatusData.content.map((status) => ({
    id: status.id,
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));
  return profileStatuses;
}

/**
 * Retrieves a list of all status, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized status objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedStatus[] {
  return listAll().map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}
