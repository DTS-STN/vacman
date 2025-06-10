import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { City } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import esdcCitiesData from '~/.server/resources/cities.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockCityService(): CityService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getAllByProvinceId: (provinceId: string) => Promise.resolve(getAllByProvinceId(provinceId)),
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
    provinceId: city.provinceId,
    name: city.name,
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
    .filter((c) => c.provinceId === provinceId)
    .map((city) => ({
      id: city.id.toString(),
      provinceId: city.provinceId,
      name: city.name,
    }));

  return Ok(cities);
}
