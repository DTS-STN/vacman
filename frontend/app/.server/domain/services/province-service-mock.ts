import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import esdcProvincesData from '~/.server/resources/provinces.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockProvinceService(): ProvinceService {
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
 * Retrieves a list of all provinces.
 *
 * @returns A promise that resolves to an array of province objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): Province[] {
  const provinces: Province[] = esdcProvincesData.content.map((province) => ({
    id: province.id.toString(),
    code: province.alphaCode,
    nameEn: province.nameEn,
    nameFr: province.nameFr,
  }));
  return provinces;
}

/**
 * Retrieves a single province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @returns The province object if found or {AppError} If the province is not found.
 */
function getById(id: string): Result<Province, AppError> {
  const result = listAll();
  const province = result.find((p) => p.id === id);

  return province ? Ok(province) : Err(new AppError(`Province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
}

/**
 * Retrieves a single province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @returns The province object if found or {AppError} If the province is not found.
 */
function getByCode(code: string): Result<Province, AppError> {
  const result = listAll();
  const province = result.find((p) => p.code === code);

  return province ? Ok(province) : Err(new AppError(`Province with code '${code}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
}

/**
 * Retrieves a list of all provinces, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized province objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedProvince[] {
  return listAll().map((province) => ({
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  }));
}

/**
 * Retrieves a single localized province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or {AppError} If the province is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedProvince, AppError> {
  const result = getById(id);
  return result.map((province) => ({
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  }));
}

/**
 * Retrieves a single localized province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or undefined If the province is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedProvince> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or {AppError} If the province is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedProvince, AppError> {
  const result = getByCode(code);
  return result.map((province) => ({
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  }));
}

/**
 * Retrieves a single localized province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or undefined If the province is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedProvince> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
