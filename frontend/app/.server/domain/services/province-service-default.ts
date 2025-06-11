import type { Result, Option } from 'oxide.ts';
import { Ok, Err, None, Some } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultProvinceService(): ProvinceService {
  return {
    /**
     * Retrieves all provinces.
     * @returns A promise that resolves to an array of province objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly Province[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Provinces. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Province[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching ESDC Branches: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a province by its ID.
     * @param id The ID of the province to retrieve.
     * @returns A promise that resolves to the province object, or {AppError} if the request fails or if the server responds with an error status.
     */
    async getById(id: string): Promise<Result<Province, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Province with ID '${id}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Province with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Province = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Province by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single province by its ID.
     *
     * @param id The ID of the province to retrieve.
     * @returns The province object if found or undefined if not found.
     */
    async findById(id: string): Promise<Option<Province>> {
      const result = await getDefaultProvinceService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((province) => province.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a province by its CODE.
     * @param code The CODE of the province to retrieve.
     * @returns A promise that resolves to the province object, or AppError if the request fails or if the server responds with an error status.
     */
    async getByCode(code: string): Promise<Result<Province, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces?code=${code}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Province with CODE '${code}' not found.`, ErrorCodes.NO_PROVINCE_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Province with CODE '${code}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Province = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Province by CODE: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single province by its CODE.
     *
     * @param code The CODE of the province to retrieve (ex. 'ON').
     * @returns The province object if found or undefined if not found.
     */

    async findByCode(code: string): Promise<Option<Province>> {
      const result = await getDefaultProvinceService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((province) => province.code === code);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves all localized provinces for a given language.
     * @param language The language code for which to retrieve localized provinces.
     * @returns A promise that resolves to an array of localized provinces or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedProvince[], AppError>> {
      const result = await getDefaultProvinceService().getAll();
      return result.map((provinces) =>
        provinces.map((province) => ({
          id: province.id,
          code: province.code,
          name: language === 'fr' ? province.nameFr : province.nameEn,
        })),
      );
    },

    /**
     * Retrieves a localized province by its ID and language.
     * @param id The ID of the province to retrieve.
     * @param language The language code for which to retrieve the localized province.
     * @returns A promise that resolves to the localized province object, or AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedProvince, AppError>> {
      const result = await getDefaultProvinceService().getById(id);

      return result.map((province) => ({
        id: province.id,
        code: province.code,
        name: language === 'fr' ? province.nameFr : province.nameEn,
      }));
    },

    /**
     * Retrieves a single localized province by its ID.
     *
     * @param id The ID of the province to retrieve.
     * @returns The localized province object if found or undefined if not found.
     */
    async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedProvince>> {
      const result = await getDefaultProvinceService().getAllLocalized(language);

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((province) => province.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a localized province by its CODE and language.
     * @param code The CODE of the province to retrieve (ex. 'ON').
     * @param language The language code for which to retrieve the localized province.
     * @returns A promise that resolves to the localized province object, or AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedProvince, AppError>> {
      const result = await getDefaultProvinceService().getByCode(code);

      return result.map((province) => ({
        id: province.id,
        code: province.code,
        name: language === 'fr' ? province.nameFr : province.nameEn,
      }));
    },

    /**
     * Retrieves a single localized province by its CODE.
     *
     * @param code The CODE of the province to retrieve (ex. 'ON').
     * @returns The localized province object if found or undefined if not found.
     */
    async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedProvince>> {
      const result = await getDefaultProvinceService().getAllLocalized(language);

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((province) => province.code === code);
      return found ? Some(found) : None;
    },
  };
}
