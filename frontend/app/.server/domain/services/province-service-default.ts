import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultProvince(): ProvinceService {
  return {
    /**
     * Retrieves all provinces.
     * @returns A promise that resolves to an array of province objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getProvinces(): Promise<readonly Province[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Provinces. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
    /**
     * Retrieves a province by its ID.
     * @param id The ID of the province to retrieve.
     * @returns A promise that resolves to the province object, or undefined if not found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getProvinceById(id: string): Promise<Province | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Province with ID. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
    /**
     * Retrieves a province by its ALPHA_CODE.
     * @param alphaCode The ALPHA_CODE of the province to retrieve.
     * @returns A promise that resolves to the province object, or undefined if not found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getProvinceByAlphaCode(alphaCode: string): Promise<Province | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces/${alphaCode}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Province with ALPHA_CODE. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
    /**
     * Retrieves all localized provinces for a given language.
     * @param language The language code for which to retrieve localized provinces.
     * @returns A promise that resolves to an array of localized provinces.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedProvinces(language: Language): Promise<readonly LocalizedProvince[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/provinces/${language}`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all localized Provinces. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
  };
}
