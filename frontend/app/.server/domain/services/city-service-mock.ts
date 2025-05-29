import type { City } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import esdcCitiesData from '~/.server/resources/cities.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockCityService(): CityService {
  return {
    getCities: () => Promise.resolve(getCities()),
    getCityById: (id: string) => Promise.resolve(getCityById(id)),
    getCityByProvinceId: (provinceId: string) => Promise.resolve(getCityByProvinceId(provinceId)),
  };
}

/**
 * Retrieves a list of all cities.
 *
 * @returns An array of cities objects.
 */
function getCities(): readonly City[] {
  return esdcCitiesData.content.map((city) => ({
    id: city.id.toString(),
    provinceId: city.provinceId,
    name: city.name,
  }));
}

/**
 * Retrieves a single city by its ID.
 *
 * @param id The ID of the city to retrieve.
 * @returns The city object if found.
 * @throws {AppError} If the city is not found.
 */
function getCityById(id: string): City {
  const city = getCities().find((p) => p.id === id);
  if (!city) {
    throw new AppError(`City with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND);
  }
  return city;
}

/**
 * Retrieves a list of all cities by province ID.
 *
 * @param provinceId The ID of the province to retrieve cities.
 * @returns An array of cities objects.
 */
function getCityByProvinceId(provinceId: string): readonly City[] {
  return getCities()
    .filter((c) => c.provinceId === provinceId)
    .map((city) => ({
      id: city.id.toString(),
      provinceId: city.provinceId,
      name: city.name,
    }));
}
