import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import esdcCitiesData from '~/.server/resources/cities.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockCityService(): CityService {
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
 * Retrieves a list of all cities.
 *
 * @returns An array of cities objects.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): City[] {
  const cities: City[] = esdcCitiesData.content.map((city) => ({
    id: city.id.toString(),
    code: city.code,
    nameEn: city.nameEn,
    nameFr: city.nameFr,
    province: {
      id: city.province.id.toString(),
      code: city.province.alphaCode,
      nameEn: city.province.nameEn,
      nameFr: city.province.nameFr,
    },
  }));
  return cities;
}

/**
 * Retrieves a single city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @returns The city object if found or {AppError} If the city is not found.
 */
function getById(id: string): Result<City, AppError> {
  const result = listAll();
  const city = result.find((p) => p.id === id);

  return city ? Ok(city) : Err(new AppError(`City with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND));
}

/**
 * Retrieves a single city by its CODE.
 *
 * @param id The CODE of the city to retrieve.
 * @returns The city object if found or {AppError} If the city is not found.
 */
function getByCode(code: string): Result<City, AppError> {
  const result = listAll();
  const city = result.find((p) => p.code === code);

  return city ? Ok(city) : Err(new AppError(`City with CODE '${code}' not found.`, ErrorCodes.NO_CITY_FOUND));
}

/**
 * Retrieves a list of all cities, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized city objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedCity[] {
  return listAll().map((city) => ({
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    province: {
      id: city.province.id.toString(),
      code: city.province.code,
      name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
    },
  }));
}

/**
 * Retrieves a single localized city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or {AppError} If the city is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedCity, AppError> {
  const result = getById(id);
  return result.map((city) => ({
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    province: {
      id: city.province.id.toString(),
      code: city.province.code,
      name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
    },
  }));
}

/**
 * Retrieves a single localized city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or undefined If the city is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedCity> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized city by its code.
 *
 * @param code The code of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or {AppError} If the city is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedCity, AppError> {
  const result = getByCode(code);
  return result.map((city) => ({
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    province: {
      id: city.province.id.toString(),
      code: city.province.code,
      name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
    },
  }));
}

/**
 * Retrieves a single localized city by its code.
 *
 * @param code The code of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or undefined If the city is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedCity> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
