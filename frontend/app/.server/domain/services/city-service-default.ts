import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import { apiFetch } from '~/.server/domain/services/makeApiRequest';
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
    const response = await apiFetch('/cities', context);

    const data: ApiResponse = await response.json();
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
    const context = `get city with ID '${id}'`;
    try {
      const response = await apiFetch(`/cities/${id}`, context);
      const data: City = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`City type with ID '${id}' not found.`, ErrorCodes.NO_CITY_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
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
    try {
      const response = await apiFetch(`/cities?code=${code}`, context);
      const data: City = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`City with CODE '${code}' not found.`, ErrorCodes.NO_CITY_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
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
