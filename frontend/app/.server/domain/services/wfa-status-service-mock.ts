import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { LocalizedWFAStatus, WFAStatus } from '~/.server/domain/models';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import wfaStatusData from '~/.server/resources/currentWFAStatus.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockWFAStatusService(): WFAStatusService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
  };
}

/**
 *  Retrieves a list of all WFA statuses.
 *
 * @returns An array of WFA status objects.
 */
function getAll(): Result<readonly WFAStatus[], AppError> {
  const statuses: WFAStatus[] = wfaStatusData.content.map((status) => ({
    id: status.id.toString(),
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));

  return Ok(statuses);
}

/**
 * Retrieves a single  WFA status by its ID.
 *
 * @param id The ID of the WFA status to retrieve.
 * @returns The WFA status object if found or {AppError} If the WFA status is not found.
 */
function getById(id: string): Result<WFAStatus, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const statuses = result.unwrap();
  const status = statuses.find((p) => p.id === id);

  return status ? Ok(status) : Err(new AppError(`WFA status with ID '${id}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
}

/**
 * Retrieves a single WFA status by its ID.
 *
 * @param id The ID of the WFA status to retrieve.
 * @returns The WFA status object if found or undefined if not found.
 */
function findById(id: string): Option<WFAStatus> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }

  const statuses = result.unwrap();
  const status = statuses.find((p) => p.id === id);

  return status ? Some(status) : None;
}

/**
 * Retrieves all WFA statuses in the specified language.
 *
 * @param language The language to localize the WFA status.
 * @returns An array of localized  WFA status objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedWFAStatus[], AppError> {
  return getAll().map((statuses) =>
    statuses.map((status) => ({
      id: status.id,
      name: language === 'fr' ? status.nameFr : status.nameEn,
    })),
  );
}

/**
 * Retrieves a single WFA status by its ID in the specified language.
 *
 * @param id The ID of the  WFA status to retrieve.
 * @param language The language to localize the  WFA status.
 * @returns The localized WFA status object if found or {Error} If the  WFA status is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedWFAStatus, AppError> {
  return getAllLocalized(language).andThen((statuses) => {
    const status = statuses.find((b) => b.id === id);

    return status
      ? Ok(status)
      : Err(new AppError(`Localized WFA Status with ID '${id}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
  });
}
