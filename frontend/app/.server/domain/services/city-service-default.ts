import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { City } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultCityService(): CityService {
  return {
    /**
     * Retrieves all cities.
     * @returns A promise that resolves to an array of city objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly City[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Cities. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: City[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching Cities: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a city by its ID.
     * @param id The ID of the city to retrieve.
     * @returns A promise that resolves to the city object, or undefined if not found or {AppError} If the city is not found or if the request fails or if the server responds with an error status.
     */
    async getById(id: string): Promise<Result<City, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`City with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the City with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: City = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching City by ID: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a single city by its ID.
     *
     * @param id The ID of the city to retrieve.
     * @returns The city object if found or undefined if not found.
     */

    async findById(id: string): Promise<Option<City>> {
      const result = await getDefaultCityService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((city) => city.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves all cities for a given province ID.
     * @param provinceId The ID of the province for which to retrieve cities.
     * @returns A promise that resolves to an array of cities in the specified province or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllByProvinceId(provinceId: string): Promise<Result<readonly City[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities?provinceId=${provinceId}`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Cities for Province ID '${provinceId}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: City[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching Cities: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },
  };
}
