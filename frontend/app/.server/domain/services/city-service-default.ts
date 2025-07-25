import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { CityService } from '~/.server/domain/services/city-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeCity(city: City, language: Language): LocalizedCity {
  return {
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    province: {
      id: city.province.id,
      code: city.province.code,
      name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
    },
  };
}

// Create a single instance of the service (Singleton)
export const cityService: CityService = {
  /**
   * Retrieves a list of all cities.
   *
   * @returns A promise that resolves to an array of city objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly City[]> {
    type ApiResponse = {
      content: readonly City[];
    };
    const context = 'list all cities';
    const response = await apiClient.get<ApiResponse>('/cities', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single city by its ID.
   *
   * @param id The ID of the city to retrieve.
   * @returns A `Result` containing the city object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<City, AppError>> {
    const context = `Get City with ID '${id}'`;

    const response = await apiClient.get<City>(`/cities/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_CITY_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }

    return response;
  },

  /**
   * Retrieves a single city by its Code.
   *
   * @param code The CODE of the city to retrieve.
   * @returns A `Result` containing the city object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<City, AppError>> {
    const context = `get city with CODE '${code}'`;
    type ApiResponse = {
      content: readonly City[];
    };
    const response = await apiClient.get<ApiResponse>(`/cities?code=${code}`, context);
    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const city = data.content.at(0); // Get the first element from the response array

    if (!city) {
      // The request was successful, but no status with that code exists.
      return Err(new AppError(`'${context}' not found.`, ErrorCodes.NO_CITY_FOUND));
    }

    return Ok(city);
  },

  // Localized methods

  /**
   * Retrieves a list of all cities, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of city type objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedCity[]> {
    const cities = await this.listAll();
    return cities.map((city) => localizeCity(city, language));
  },

  /**
   * Retrieves a single localized city by its ID.
   *
   * @param id The ID of the city to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized city object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedCity, AppError>> {
    const result = await this.getById(id);
    return result.map((city) => localizeCity(city, language));
  },

  /**
   * Retrieves a single localized city by its CODE.
   *
   * @param code The CODE of the city to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized city object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedCity, AppError>> {
    const result = await this.getByCode(code);
    return result.map((city) => localizeCity(city, language));
  },

  /**
   * Finds a single localized city by its ID.
   *
   * @param id The ID of the city to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized city object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedCity>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized city by its CODE.
   *
   * @param code The CODE of the city to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized city object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedCity>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultCityService(): CityService {
  return cityService;
}
