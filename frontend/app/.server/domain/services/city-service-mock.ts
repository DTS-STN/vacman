import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import esdcCitiesData from '~/.server/resources/cities.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockCityService(): CityService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    getAllByProvinceId: (provinceId: string) => Promise.resolve(getAllByProvinceId(provinceId)),
    getAllByProvinceCode: (provinceCode: string) => Promise.resolve(getAllByProvinceCode(provinceCode)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
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
 */
function getAll(): Result<readonly City[], AppError> {
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

  return Ok(cities);
}

/**
 * Retrieves a single city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @returns The city object if found or {AppError} If the city is not found.
 */
function getById(id: string): Result<City, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const cities = result.unwrap();
  const city = cities.find((p) => p.id === id);

  return city ? Ok(city) : Err(new AppError(`City with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND));
}

/**
 * Retrieves a single city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @returns The city object if found or undefined if not found.
 */
function findById(id: string): Option<City> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const cities = result.unwrap();
  const city = cities.find((p) => p.id === id);

  return city ? Some(city) : None;
}

/**
 * Retrieves a single city by its CODE.
 *
 * @param id The CODE of the city to retrieve.
 * @returns The city object if found or {AppError} If the city is not found.
 */
function getByCode(code: string): Result<City, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const cities = result.unwrap();
  const city = cities.find((p) => p.code === code);

  return city ? Ok(city) : Err(new AppError(`City with CODE '${code}' not found.`, ErrorCodes.NO_CITY_FOUND));
}

/**
 * Retrieves a single city by its CODE.
 *
 * @param code The CODE of the city to retrieve.
 * @returns The city object if found or undefined if not found.
 */
function findByCode(code: string): Option<City> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const cities = result.unwrap();
  const city = cities.find((p) => p.code === code);

  return city ? Some(city) : None;
}

/**
 * Retrieves a list of all cities by province ID.
 *
 * @param provinceId The ID of the province to retrieve cities.
 * @returns An array of cities objects.
 */
function getAllByProvinceId(provinceId: string): Result<readonly City[], AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const allCities = result.unwrap();

  const cities = allCities
    .filter((c) => c.province.id === provinceId)
    .map((city) => ({
      id: city.id.toString(),
      code: city.code,
      nameEn: city.nameEn,
      nameFr: city.nameFr,
      province: {
        id: city.province.id.toString(),
        code: city.province.code,
        nameEn: city.province.nameEn,
        nameFr: city.province.nameFr,
      },
    }));

  return Ok(cities);
}

/**
 * Retrieves a list of all cities by province ID.
 *
 * @param provinceId The ID of the province to retrieve cities.
 * @returns An array of cities objects.
 */
function getAllByProvinceCode(provinceCode: string): Result<readonly City[], AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const allCities = result.unwrap();

  const cities = allCities
    .filter((c) => c.province.code === provinceCode)
    .map((city) => ({
      id: city.id.toString(),
      code: city.code,
      nameEn: city.nameEn,
      nameFr: city.nameFr,
      province: {
        id: city.province.id.toString(),
        code: city.province.code,
        nameEn: city.province.nameEn,
        nameFr: city.province.nameFr,
      },
    }));

  return Ok(cities);
}

/**
 * Retrieves a list of cities localized to the specified language.
 *
 * @param language The language to localize the city names to.
 * @returns An array of localized city objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedCity[], AppError> {
  return getAll().map((cities) =>
    cities.map((city) => ({
      id: city.id,
      code: city.code,
      name: language === 'fr' ? city.nameFr : city.nameEn,
      province: {
        id: city.province.id.toString(),
        code: city.province.code,
        name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
      },
    })),
  );
}

/**
 * Retrieves a single localized city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or {AppError} If the city is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedCity, AppError> {
  return getAllLocalized(language).andThen((cities) => {
    const city = cities.find((c) => c.id === id);

    return city ? Ok(city) : Err(new AppError(`Localized city with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND));
  });
}

/**
 * Retrieves a single localized city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or undefined If the city is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedCity> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const cities = result.unwrap();
  const city = cities.find((p) => p.id === id);

  return city ? Some(city) : None;
}

/**
 * Retrieves a single localized city by its code.
 *
 * @param code The code of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or {AppError} If the city is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedCity, AppError> {
  return getAllLocalized(language).andThen((cities) => {
    const city = cities.find((c) => c.code === code);

    return city ? Ok(city) : Err(new AppError(`Localized city with code '${code}' not found.`, ErrorCodes.NO_CITY_FOUND));
  });
}

/**
 * Retrieves a single localized city by its code.
 *
 * @param code The code of the city to retrieve.
 * @param language The language to localize the city name to.
 * @returns The localized city object if found or undefined If the city is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedCity> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const cities = result.unwrap();
  const city = cities.find((c) => c.code === code);

  return city ? Some(city) : None;
}
