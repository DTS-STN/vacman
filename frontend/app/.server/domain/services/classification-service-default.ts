import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { Classification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultClassificationService(): ClassificationService {
  return {
    /**
     * Retrieves a list of all esdc classification groups and levels.
     *
     * @returns An array of esdc classification objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly Classification[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classifications`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Classifications. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Classification[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Classifications: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single esdc classification by its ID.
     *
     * @param id The ID of the esdc classification to retrieve.
     * @returns The esdc classification object if found or {AppError} If the esdc classification is not found or if the request fails or if the server responds with an error status.
     */
    async getById(id: string): Promise<Result<Classification, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classifications/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Classification with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Classification with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Classification = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Classification by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single esdc classification by its ID.
     *
     * @param id The ID of the esdc classification to retrieve or undefined if not found.
     * @returns The esdc classification object if found or {AppError} If the esdc classification is not found or if the request fails or if the server responds with an error status.
     */
    async findById(id: string): Promise<Option<Classification>> {
      const result = await getDefaultClassificationService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((classification) => classification.id === id);
      return found ? Some(found) : None;
    },
  };
}
