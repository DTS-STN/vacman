import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
// Centralized API request logic
async function makeApiRequest<T>(path: string, context: string): Promise<Result<T, AppError>> {
  try {
    const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}${path}`);

    if (response.status === HttpStatusCodes.NOT_FOUND) {
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_CITY_FOUND));
    }

    if (!response.ok) {
      return Err(
        new AppError(
          `Failed to ${context.toLowerCase()}. Server responded with status ${response.status}.`,
          ErrorCodes.VACMAN_API_ERROR,
        ),
      );
    }

    // Handle cases where the server returns 204 No Content for a successful empty response
    if (response.status === HttpStatusCodes.NO_CONTENT) {
      return Ok([] as unknown as T); // Return an empty array or appropriate empty value
    }

    const data: T = await response.json();
    return Ok(data);
  } catch (error) {
    return Err(
      new AppError(`Unexpected error occurred while ${context.toLowerCase()}: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
    );
  }
}

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
  getAll(): Promise<Result<readonly City[], AppError>> {
    return makeApiRequest('/cities', 'Retrieve all cities');
  },

  getById(id: string): Promise<Result<City, AppError>> {
    return makeApiRequest(`/cities/${id}`, `Find city with ID '${id}'`);
  },

  getByCode(code: string): Promise<Result<City, AppError>> {
    return makeApiRequest(`/cities?code=${code}`, `Find city with CODE '${code}'`);
  },

  getAllByProvinceId(provinceId: string): Promise<Result<readonly City[], AppError>> {
    return makeApiRequest(`/cities?provinceId=${provinceId}`, `Retrieve cities for province ID '${provinceId}'`);
  },

  getAllByProvinceCode(provinceCode: string): Promise<Result<readonly City[], AppError>> {
    return makeApiRequest(`/cities?provinceCode=${provinceCode}`, `Retrieve cities for province CODE '${provinceCode}'`);
  },

  async findById(id: string): Promise<Option<City>> {
    const result = await this.getById(id);
    // .ok() converts a Result<T, E> into an Option<T>
    return result.ok();
  },

  async findByCode(code: string): Promise<Option<City>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods
  async getAllLocalized(language: Language): Promise<Result<readonly LocalizedCity[], AppError>> {
    const result = await this.getAll();
    return result.map((cities) => cities.map((city) => localizeCity(city, language)));
  },

  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedCity, AppError>> {
    const result = await this.getById(id);
    return result.map((city) => localizeCity(city, language));
  },

  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedCity, AppError>> {
    const result = await this.getByCode(code);
    return result.map((city) => localizeCity(city, language));
  },

  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedCity>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedCity>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultCityService(): CityService {
  return cityService;
}
