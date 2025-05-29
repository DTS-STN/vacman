import type { CurrentWFAStatus, LocalizedCurrentWFAStatus } from '~/.server/domain/models';
import type { CurrentWFAStatusService } from '~/.server/domain/services/current-wfa-status-service';
import currentWFAStatus from '~/.server/resources/currentWFAStatus.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockCurrentWFAStatusService(): CurrentWFAStatusService {
  return {
    getCurrentWFAStatuses: () => Promise.resolve(getCurrentWFAStatuses()),
    getCurrentWFAStatusById: (id: string) => Promise.resolve(getCurrentWFAStatusById(id)),
    getLocalizedCurrentWFAStatuses: (language: Language) => Promise.resolve(getLocalizedCurrentWFAStatuses(language)),
    getLocalizedCurrentWFAStatusById: (id: string, language: Language) =>
      Promise.resolve(getLocalizedCurrentWFAStatusById(id, language)),
  };
}

/**
 *  Retrieves a list of all current WFA statuses.
 *
 * @returns An array of current WFA status objects.
 */
function getCurrentWFAStatuses(): readonly CurrentWFAStatus[] {
  return currentWFAStatus.content.map((status) => ({
    id: status.id.toString(),
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));
}

/**
 * Retrieves a single current WFA status by its ID.
 *
 * @param id The ID of the current WFA status to retrieve.
 * @returns The current WFA status object if found.
 * @throws {AppError} If the current WFA status is not found.
 */
function getCurrentWFAStatusById(id: string): CurrentWFAStatus {
  const status = getCurrentWFAStatuses().find((s) => s.id === id);
  if (!status) {
    throw new AppError(`Current WFA status with ID '${id}' not found.`, ErrorCodes.NO_CURRENT_WFA_STATUS_FOUND);
  }
  return status;
}

/**
 * Retrieves all current WFA statuses in the specified language.
 *
 * @param language The language to localize the current WFA status.
 * @returns An array of localized current WFA status objects.
 */
function getLocalizedCurrentWFAStatuses(language: Language): readonly LocalizedCurrentWFAStatus[] {
  return getCurrentWFAStatuses().map((status) => ({
    id: status.id,
    name: language === 'en' ? status.nameEn : status.nameFr,
  }));
}

/**
 * Retrieves a single current WFA status by its ID in the specified language.
 *
 * @param id The ID of the current WFA status to retrieve.
 * @param language The language to localize the current WFA status.
 * @returns The localized current WFA status object if found.
 * @throws {Error} If the current WFA status is not found.
 */
function getLocalizedCurrentWFAStatusById(id: string, language: Language): LocalizedCurrentWFAStatus {
  const status = getCurrentWFAStatusById(id);
  return {
    id: status.id,
    name: language === 'en' ? status.nameEn : status.nameFr,
  };
}
