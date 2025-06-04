import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

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

    async getAll(): Promise<Result<readonly Branch[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/branches`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all ESDC Branches. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Branch[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching branches: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a single branch by its ID.
     *
     * @param id The ID of the branch to retrieve.
     * @returns The branch object if found.
     * @throws {AppError} If the branch is not found or if the request fails or if the server responds with an error status.
     */

    async getById(id: string): Promise<Result<Branch, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/branches/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the ESDC Branch with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: Branch = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching branch by ID: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a single branch by its ID.
     *
     * @param id The ID of the branch to retrieve.
     * @returns The branch object if found or undefined if not found.
     * @throws {AppError} If the request fails or if the server responds with an error status.
     */

    async findById(id: string): Promise<Option<Branch>> {
      const result = await getDefaultBranchService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((branch) => branch.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a list of branches localized to the specified language.
     *
     * @param language The language to localize the branch names to.
     * @returns An array of localized branch objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */

    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedBranch[], AppError>> {
      const result = await getDefaultBranchService().getAll();

      return result.map((branches) =>
        branches.map((branch) => ({
          id: branch.id,
          name: language === 'fr' ? branch.nameFr : branch.nameEn,
        })),
      );
    },

    /**
     * Retrieves a single localized branch by its ID.
     *
     * @param id The ID of the branch to retrieve.
     * @param language The language to localize the branch name to.
     * @returns The localized branch object if found.
     * @throws {AppError} If the branch is not found or if the request fails or if the server responds with an error status.
     */

    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedBranch, AppError>> {
      const result = await getDefaultBranchService().getById(id);

      return result.map((branch) => ({
        id: branch.id,
        name: language === 'fr' ? branch.nameFr : branch.nameEn,
      }));
    },
  };
}
