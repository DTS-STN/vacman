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
     * @returns An array of esdc classification objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getClassifications(): Promise<readonly Classification[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classifications`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Classifications. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single esdc classification by its ID.
     *
     * @param id The ID of the esdc classification to retrieve.
     * @returns The esdc classification object if found.
     * @throws AppError If the esdc classification is not found or if the request fails or if the server responds with an error status.
     */
    async getClassificationById(id: string): Promise<Classification> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classifications/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        throw new AppError(`Classification with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND);
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Classification with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
  };
}
