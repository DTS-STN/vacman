import type { Branch, LocalizedBranch } from '~/.server/domain/models';
import type { BranchService } from '~/.server/domain/services/branch-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultBranchService(): BranchService {
  return {
    /**
     * Retrieves a list of all esdc branches.
     *
     * @returns An array of esdc branch objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getBranches(): Promise<readonly Branch[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/branches`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all ESDC Branches. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single branch by its ID.
     *
     * @param id The ID of the branch to retrieve.
     * @returns The branch object if found.
     * @throws {AppError} If the branch is not found or if the request fails or if the server responds with an error status.
     */
    async getBranchById(id: string): Promise<Branch | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/branches/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the ESDC Branch with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a list of branches localized to the specified language.
     *
     * @param language The language to localize the branch names to.
     * @returns An array of localized branch objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedBranches(language: Language): Promise<readonly LocalizedBranch[]> {
      const response = await getDefaultBranchService().getBranches();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },

    /**
     * Retrieves a single localized branch by its ID.
     *
     * @param id The ID of the branch to retrieve.
     * @param language The language to localize the branch name to.
     * @returns The localized branch object if found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedBranchById(id: string, language: Language): Promise<LocalizedBranch | undefined> {
      const response = await getDefaultBranchService().getLocalizedBranches(language);
      return response.find((l) => l.id === id);
    },
  };
}
