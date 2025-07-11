import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LocalizedWFAStatus, WFAStatus } from '~/.server/domain/models';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import wfaStatusData from '~/.server/resources/currentWFAStatus.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockWFAStatusService(): WFAStatusService {
  return {
    listAll: () => Promise.resolve(listAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 *  Retrieves a list of all WFA statuses.
 *
 * @returns An array of WFA status objects. The array will be empty if none are found.
 */
function listAll(): WFAStatus[] {
  const statuses: WFAStatus[] = wfaStatusData.content.map((status) => ({
    id: status.id.toString(),
    code: status.code,
    nameEn: status.nameEn,
    nameFr: status.nameFr,
  }));
  return statuses;
}

/**
 * Retrieves a single WFA status by its ID.
 *
 * @param id The ID of the WFA status to retrieve.
 * @returns The WFA status object if found or {AppError} If the WFA status is not found.
 */
function getById(id: string): Result<WFAStatus, AppError> {
  const result = listAll();
  const status = result.find((p) => p.id === id);

  return status ? Ok(status) : Err(new AppError(`WFA status with ID '${id}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
}

/**
 * Retrieves a single WFA status by its CODE.
 *
 * @param code The CODE of the WFA status to retrieve.
 * @returns The WFA status object if found or {AppError} If the WFA status is not found.
 */
function getByCode(code: string): Result<WFAStatus, AppError> {
  const result = listAll();
  const status = result.find((p) => p.code === code);

  return status ? Ok(status) : Err(new AppError(`WFA status with CODE '${code}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
}

/**
 * Retrieves all WFA statuses in the specified language.
 *
 * @param language The language to localize the WFA status.
 * @returns An array of localized  WFA status objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedWFAStatus[] {
  return listAll().map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}

/**
 * Retrieves a single WFA status by its ID in the specified language.
 *
 * @param id The ID of the  WFA status to retrieve.
 * @param language The language to localize the  WFA status.
 * @returns The localized WFA status object if found or {AppError} If the  WFA status is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedWFAStatus, AppError> {
  const result = getById(id);
  return result.map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}

/**
 * Retrieves a single WFA status by its ID in the specified language.
 *
 * @param id The ID of the  WFA status to retrieve.
 * @param language The language to localize the  WFA status.
 * @returns The localized WFA status object if found or undefined If the  WFA status is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedWFAStatus> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized WFA status by its CODE.
 *
 * @param code The CODE of the WFA status to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized WFA status object if found or {AppError} If the WFA status is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedWFAStatus, AppError> {
  const result = getByCode(code);
  return result.map((status) => ({
    id: status.id,
    code: status.code,
    name: language === 'fr' ? status.nameFr : status.nameEn,
  }));
}

/**
 * Retrieves a single localized WFA status by its CODE.
 *
 * @param code The CODE of the WFA status to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized WFA status object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedWFAStatus> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
