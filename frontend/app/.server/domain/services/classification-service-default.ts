import type { ClassificationGroup, ClassificationLevel } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultClassificationService(): ClassificationService {
  return {
    /**
     * Retrieves a list of all esdc classification groups.
     *
     * @returns An array of esdc classification group objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getClassificationGroups(): Promise<readonly ClassificationGroup[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classification-groups`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all ClassificationGroups. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single esdc classification group by its ID.
     *
     * @param id The ID of the esdc classification group to retrieve.
     * @returns The esdc classification group object if found.
     * @throws AppError If the esdc classification group is not found or if the request fails or if the server responds with an error status.
     */
    async getClassificationGroupById(id: string): Promise<ClassificationGroup | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/classification-groups/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the ClassificationGroup with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     *
     * @param classificationGroupId The ID of the classification group to retrieve levels from.
     * @returns The esdc classification levels associated with the specified classification group.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getClassificationLevelByClassificationGroup(
      classificationGroupId: string,
    ): Promise<readonly ClassificationLevel[] | undefined> {
      const response = await getDefaultClassificationService().getClassificationGroupById(classificationGroupId);
      return response?.levels.map((option) => ({
        id: option.id,
        name: option.name,
      }));
    },

    /**
     * Retrieves a single esdc classification level by its ID.
     *
     * @param classificationGroupId The ID of the esdc classification group to retrieve.
     * @param classificationLevelId The ID of the esdc classification level to retrieve.
     * @returns The esdc classification level object associated with the specified classification group if found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getClassificationLevelById(
      classificationGroupId: string,
      classificationLevelId: string,
    ): Promise<ClassificationLevel | undefined> {
      const response = await getDefaultClassificationService().getClassificationGroupById(classificationGroupId);
      return response?.levels.find((l) => l.id === classificationLevelId);
    },
  };
}
