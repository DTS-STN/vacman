import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import type { EducationLevelService } from '~/.server/domain/services/education-level-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultEducationLevelService(): EducationLevelService {
  return {
    /**
     *  Retrieves a list of all education levels.
     *
     * @returns An array of education level objects.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly EducationLevel[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/education-levels`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Education Levels. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: EducationLevel[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Education Levels: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single education level by its ID.
     *
     * @param id The ID of the education level to retrieve.
     * @returns The education level object if found or {AppError} If the education level is not found or if the request fails or if the server responds with an error status.
     */
    async getById(id: string): Promise<Result<EducationLevel, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/education-levels/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Branch with ID '${id}' not found.`, ErrorCodes.NO_BRANCH_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Education Level with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: EducationLevel = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Education Level by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
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

    async findById(id: string): Promise<Option<EducationLevel>> {
      const result = await getDefaultEducationLevelService().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((level) => level.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves all education levels in the specified language.
     *
     * @param language The language to localize the education level.
     * @returns An array of localized education level objects.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllLocalized(language: Language): Promise<Result<readonly LocalizedEducationLevel[], AppError>> {
      const result = await getDefaultEducationLevelService().getAll();

      return result.map((levels) =>
        levels.map((level) => ({
          id: level.id,
          name: language === 'fr' ? level.nameFr : level.nameEn,
        })),
      );
    },

    /**
     * * Retrieves a single education level by its name in English or French.
     *
     * @param id The ID of the education level to retrieve.
     * @param language The language to localize the education level to
     * @returns The localized education level object if found.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedEducationLevel, AppError>> {
      const result = await getDefaultEducationLevelService().getById(id);

      return result.map((level) => ({
        id: level.id,
        name: language === 'fr' ? level.nameFr : level.nameEn,
      }));
    },
  };
}
