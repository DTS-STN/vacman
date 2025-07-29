import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LocalizedProfileStatus, ProfileStatus } from '~/.server/domain/models';
import type { ProfileStatusService } from '~/.server/domain/services/profile-status-service';
import profileStatusData from '~/.server/resources/profileStatus.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockProfileStatusService(): ProfileStatusService {
  return {
    listAll: () => Promise.resolve(listAll()),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getById: (id: string) => Promise.resolve(getById(id)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
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
    id: status.id.toString(),
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
function listAllLocalized(language: Language): LocalizedProfileStatus[] {
  return listAll().map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}

/**
 * Retrieves a single profile status by its ID.
 *
 * @param id The ID of the profile status to retrieve.
 * @returns The profile status object if found or {AppError} If the profile status is not found.
 */
function getById(id: string): Result<ProfileStatus, AppError> {
  const result = listAll();
  const status = result.find((p) => p.id === id);

  return status
    ? Ok(status)
    : Err(new AppError(`Profile status with ID '${id}' not found.`, ErrorCodes.NO_PROFILE_STATUS_FOUND));
}

/**
 * Retrieves a single profile status by its ID in the specified language.
 *
 * @param id The ID of the profile status to retrieve.
 * @param language The language to localize the profile status.
 * @returns The localized profile status object if found or {AppError} If the profile status is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedProfileStatus, AppError> {
  const result = getById(id);
  return result.map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}

/**
 * Retrieves a single profile status by its ID in the specified language.
 *
 * @param id The ID of the profile status to retrieve.
 * @param language The language to localize the profile status.
 * @returns The localized profile status object if found or undefined If the profile status is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedProfileStatus> {
  const result = getLocalizedById(id, language);
  return result.ok();
}
