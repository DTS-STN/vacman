import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import esdcProvincesData from '~/.server/resources/provinces.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockProvinceService(): ProvinceService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all provinces.
 *
 * @returns An array of province objects.
 */
function getAll(): Result<readonly Province[], AppError> {
  const provinces: Province[] = esdcProvincesData.content.map((province) => ({
    id: province.id,
    code: province.alphaCode,
    nameEn: province.nameEn,
    nameFr: province.nameFr,
  }));

  return Ok(provinces);
}

/**
 * Retrieves a single province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @returns The province object if found or {AppError} If the province is not found.
 */
function getById(id: string): Result<Province, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const provinces = result.unwrap();
  const province = provinces.find((p) => p.id === id);

  return province ? Ok(province) : Err(new AppError(`Province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
}

/**
 * Retrieves a single province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @returns The province object if found or undefined If the province is not found.
 */
function findById(id: string): Option<Province> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const provinces = result.unwrap();
  const province = provinces.find((p) => p.id === id);

  return province ? Some(province) : None;
}

/**
 * Retrieves a single province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @returns The province object if found or {AppError} If the province is not found.
 */
function getByCode(code: string): Result<Province, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const provinces = result.unwrap();
  const province = provinces.find((p) => p.code === code);

  return province ? Ok(province) : Err(new AppError(`Province with code '${code}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
}

/**
 * Retrieves a single province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @returns The province object if found or undefined If the province is not found.
 */
function findByCode(code: string): Option<Province> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const provinces = result.unwrap();
  const province = provinces.find((p) => p.code === code);

  return province ? Some(province) : None;
}

/**
 * Retrieves a list of provinces localized to the specified language.
 *
 * @param language The language to localize the province names to.
 * @returns An array of localized province objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedProvince[], AppError> {
  return getAll().map((provinces) =>
    provinces.map((province) => ({
      id: province.id,
      code: province.code,
      name: language === 'fr' ? province.nameFr : province.nameEn,
    })),
  );
}

/**
 * Retrieves a single localized province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or {AppError} If the province is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedProvince, AppError> {
  return getAllLocalized(language).andThen((provinces) => {
    const province = provinces.find((b) => b.id === id);

    return province
      ? Ok(province)
      : Err(new AppError(`Localized province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
  });
}

/**
 * Retrieves a single localized province by its ID.
 *
 * @param id The ID of the province to retrieve.
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or undefined If the province is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedProvince> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const provinces = result.unwrap();
  const province = provinces.find((p) => p.id === id);

  return province ? Some(province) : None;
}

/**
 * Retrieves a single localized province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or {AppError} If the province is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedProvince, AppError> {
  return getAllLocalized(language).andThen((provinces) => {
    const province = provinces.find((b) => b.code === code);

    return province
      ? Ok(province)
      : Err(new AppError(`Localized province with code '${code}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
  });
}

/**
 * Retrieves a single localized province by its code.
 *
 * @param code The code of the province to retrieve (ex. 'ON').
 * @param language The language to localize the province name to.
 * @returns The localized province object if found or undefined If the province is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedProvince> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const provinces = result.unwrap();
  const province = provinces.find((p) => p.code === code);

  return province ? Some(province) : None;
}
