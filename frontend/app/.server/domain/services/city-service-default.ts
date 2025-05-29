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
     * @returns A promise that resolves to an array of city objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getCities(): Promise<readonly City[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Cities. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a city by its ID.
     * @param id The ID of the city to retrieve.
     * @returns A promise that resolves to the city object, or undefined if not found.
     * @throws AppError If the city is not found or if the request fails or if the server responds with an error status.
     */
    async getCityById(id: string): Promise<City | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the City with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves all cities for a given province ID.
     * @param provinceId The ID of the province for which to retrieve cities.
     * @returns A promise that resolves to an array of cities in the specified province.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getCityByProvinceId(provinceId: string): Promise<readonly City[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/cities?provinceId=${provinceId}`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve Cities for Province ID '${provinceId}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
  };
}
