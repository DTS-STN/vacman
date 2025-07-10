import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LocalizedDirectorate, Directorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import workUnitData from '~/.server/resources/workUnit.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockDirectorateService(): DirectorateService {
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
 * Retrieves a list of all esdc directorates.
 *
 * @returns A promise that resolves to an array of esdc directorates objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): Directorate[] {
  const directorates: Directorate[] = workUnitData.content
    .filter((c) => c.parent !== null)
    .map((directorate) => ({
      id: directorate.id.toString(),
      code: directorate.code,
      nameEn: directorate.nameEn,
      nameFr: directorate.nameFr,
      parent: {
        id: directorate.parent.id.toString(),
        code: directorate.parent.code,
        nameEn: directorate.parent.nameEn,
        nameFr: directorate.parent.nameFr,
      },
    }));
  return directorates;
}

/**
 * Retrieves a single directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @returns The directorate object if found or {AppError} If the directorate is not found.
 */
function getById(id: string): Result<Directorate, AppError> {
  const result = listAll();
  const directorate = result.find((p) => p.id === id);

  return directorate
    ? Ok(directorate)
    : Err(new AppError(`Directorate with ID '${id}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
}

/**
 * Retrieves a single directorate by its CODE.
 *
 * @param code The CODE of the directorate to retrieve.
 * @returns The directorate object if found or {AppError} If the directorate is not found.
 */
function getByCode(code: string): Result<Directorate, AppError> {
  const result = listAll();
  const directorate = result.find((p) => p.code === code);

  return directorate
    ? Ok(directorate)
    : Err(new AppError(`Directorate with CODE '${code}' not found.`, ErrorCodes.NO_DIRECTORATE_FOUND));
}

/**
 * Retrieves a list of all directorates, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized directorate objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedDirectorate[] {
  return listAll()
    .map((directorate) => ({
      id: directorate.id,
      code: directorate.code,
      name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
      parent: {
        id: directorate.parent.id,
        code: directorate.parent.code,
        name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' }));
}

/**
 * Retrieves a single localized directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or {AppError} If the directorate is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedDirectorate, AppError> {
  const result = getById(id);
  return result.map((directorate) => ({
    id: directorate.id,
    code: directorate.code,
    name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
    parent: {
      id: directorate.parent.id,
      code: directorate.parent.code,
      name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
    },
  }));
}

/**
 * Retrieves a single localized directorate by its ID.
 *
 * @param id The ID of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or undefined If the directorate is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedDirectorate> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized directorate by its code.
 *
 * @param code The code of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or {AppError} If the directorate is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedDirectorate, AppError> {
  const result = getByCode(code);
  return result.map((directorate) => ({
    id: directorate.id,
    code: directorate.code,
    name: language === 'fr' ? directorate.nameFr : directorate.nameEn,
    parent: {
      id: directorate.parent.id,
      code: directorate.parent.code,
      name: language === 'fr' ? directorate.parent.nameFr : directorate.parent.nameEn,
    },
  }));
}

/**
 * Retrieves a single localized directorate by its code.
 *
 * @param code The code of the directorate to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized directorate object if found or undefined If the directorate is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedDirectorate> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
