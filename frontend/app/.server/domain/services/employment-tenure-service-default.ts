import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultEmploymentTenureService(): EmploymentTenureService {
  return {
    /**
     * Retrieves a list of all employment tenures.
     *
     * @returns An array of employment tenure objects or {AppError} if the request fails or if the server responds with an error status.
     */

    async getAll(): Promise<Result<readonly EmploymentTenure[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/employment-tenures`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Employment Tenures. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: EmploymentTenure[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Employment Tenures: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single employment tenure by its ID.
     *
     * @param id The ID of the employment tenure to retrieve.
     * @returns The employment tenure object if found or {AppError} If the employment tenure is not found or if the request fails or if the server responds with an error status.
     */

    async getById(id: string): Promise<Result<EmploymentTenure, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/employment-tenures/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Employment Tenure with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Employment Tenure with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: EmploymentTenure = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Employment Tenure by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single employment tenure by its ID.
     *
     * @param id The ID of the employment tenure to retrieve.
     * @returns The employment tenure object if found or undefined if not found.
     */

    async findById(id: string): Promise<Option<EmploymentTenure>> {
      const result = await getDefaultEmploymentTenureService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((employmentTenure) => employmentTenure.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a list of employment tenures localized to the specified language.
     *
     * @param language The language to localize the employment tenure names to.
     * @returns An array of localized employment tenure objects or {AppError} if the request fails or if the server responds with an error status.
     */

    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedEmploymentTenure[], AppError>> {
      const result = await getDefaultEmploymentTenureService().getAll();

      return result.map((employmentTenures) =>
        employmentTenures.map((employmentTenure) => ({
          id: employmentTenure.id,
          name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
        })),
      );
    },

    /**
     * Retrieves a single localized employment tenure by its ID.
     *
     * @param id The ID of the employment tenure to retrieve.
     * @param language The language to localize the employment tenure name to.
     * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found or if the request fails or if the server responds with an error status.
     */

    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEmploymentTenure, AppError>> {
      const result = await getDefaultEmploymentTenureService().getById(id);

      return result.map((employmentTenure) => ({
        id: employmentTenure.id,
        name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
      }));
    },
  };
}
