import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { WFAStatus, LocalizedWFAStatus } from '~/.server/domain/models';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultWFAStatusService(): WFAStatusService {
  return {
    /**
     * Retrieves all WFA statuses.
     *
     * @returns An array of WFA status objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly WFAStatus[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/wfa-statuses`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all WFA Statuses. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: WFAStatus[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching ESDC Branches: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a WFA status by its ID.
     *
     * @param id The ID of the WFA status to retrieve.
     * @returns A WFA status object or {AppError} If the server responds with an error status.
     */
    async getById(id: string): Promise<Result<WFAStatus, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/wfa-statuses/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`WFA Status with ID '${id}' not found.`, ErrorCodes.NO_WFA_STATUS_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the WFA Status with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: WFAStatus = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching the WFA Status by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a WFA status by its ID.
     *
     * @param id The ID of the WFA status to retrieve.
     * @returns A WFA status object or undefined if the WFA status is not found.
     */
    async findById(id: string): Promise<Option<WFAStatus>> {
      const result = await getDefaultWFAStatusService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((status) => status.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves all WFA statuses in the specified language.
     *
     * @param language The language to localize the WFA statuses.
     * @returns An array of localized WFA status objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedWFAStatus[], AppError>> {
      const result = await getDefaultWFAStatusService().getAll();

      return result.map((WFAStatuses) =>
        WFAStatuses.map((status) => ({
          id: status.id,
          name: language === 'fr' ? status.nameFr : status.nameEn,
        })),
      );
    },

    /**
     * Retrieves a single WFA status by its ID in the specified language.
     * @param id The ID of the WFA status to retrieve.
     * @param language The language to localize the WFA status.
     * @returns A localized WFA status object, or undefined if not found.
     */
    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>> {
      const result = await getDefaultWFAStatusService().getById(id);

      return result.map((status) => ({
        id: status.id,
        name: language === 'fr' ? status.nameFr : status.nameEn,
      }));
    },
  };
}
