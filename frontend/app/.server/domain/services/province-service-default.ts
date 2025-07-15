import type { Result, Option } from 'oxide.ts';
import { Ok, Err } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { apiFetch } from '~/.server/domain/services/makeApiRequest';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeProvince(province: Province, language: Language): LocalizedProvince {
  return {
    id: province.id,
    code: province.code,
    name: language === 'fr' ? province.nameFr : province.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const provinceService: ProvinceService = {
  /**
   * Retrieves a list of all provinces.
   *
   * @returns A promise that resolves to an array of province objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly Province[]> {
    type ApiResponse = {
      content: readonly Province[];
    };
    const context = 'list all provinces';
    const response = await apiFetch('/provinces', context);

    const data: ApiResponse = await response.json();
    return data.content; //TODO: The API is returning "data" instead of "content". Need to fix API to return "content" and then update it to return data.content
  },

  /**
   * Retrieves a province by its ID.
   * @param id The ID of the province to retrieve.
   * @returns A promise that resolves to the province object, or {AppError} if the request fails or if the server responds with an error status.
   */
  async getById(id: string): Promise<Result<Province, AppError>> {
    const context = `get province with ID '${id}'`;
    try {
      const response = await apiFetch(`/provinces/${id}`, context);
      const data: Province = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`Province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
  },

  /**
   * Retrieves a province by its CODE.
   * @param code The CODE of the province to retrieve.
   * @returns A promise that resolves to the province object, or AppError if the request fails or if the server responds with an error status.
   */
  async getByCode(code: string): Promise<Result<Province, AppError>> {
    const context = `get province with CODE '${code}'`;
    try {
      const response = await apiFetch(`/provinces?code=${code}`, context);
      const data: Province = await response.json();
      return Ok(data);
    } catch (error) {
      if (error instanceof AppError && error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`Province with CODE '${code}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
      }
      // Re-throw any other error
      throw error;
    }
  },

  // Localized methods

  /**
   * Retrieves a list of all provinces, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized province objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedProvince[]> {
    const provinces = await this.listAll();
    return provinces.map((province) => localizeProvince(province, language));
  },

  /**
   * Retrieves a localized province by its ID and language.
   * @param id The ID of the province to retrieve.
   * @param language The language code for which to retrieve the localized province.
   * @returns A promise that resolves to the localized province object, or AppError if the request fails or if the server responds with an error status.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedProvince, AppError>> {
    const result = await this.getById(id);
    return result.map((province) => localizeProvince(province, language));
  },

  /**
   * Retrieves a single localized province by its ID.
   *
   * @param id The ID of the province to retrieve.
   * @returns The localized province object if found or undefined if not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedProvince>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Retrieves a localized province by its CODE and language.
   * @param code The CODE of the province to retrieve (ex. 'ON').
   * @param language The language code for which to retrieve the localized province.
   * @returns A promise that resolves to the localized province object, or AppError if the request fails or if the server responds with an error status.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedProvince, AppError>> {
    const result = await this.getByCode(code);
    return result.map((province) => localizeProvince(province, language));
  },

  /**
   * Retrieves a single localized province by its CODE.
   *
   * @param code The CODE of the province to retrieve (ex. 'ON').
   * @returns The localized province object if found or undefined if not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedProvince>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultProvinceService(): ProvinceService {
  return provinceService;
}
