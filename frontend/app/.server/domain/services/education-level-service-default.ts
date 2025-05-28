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
    async getEducationLevels(): Promise<readonly EducationLevel[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/education-levels`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Education Levels. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single education level by its ID.
     *
     * @param id The ID of the education level to retrieve.
     * @returns The education level object if found.
     * @throws {AppError} If the education level is not found or if the request fails or if the server responds with an error status.
     */
    async getEducationLevelById(id: string): Promise<EducationLevel | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/education-levels/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Education Level with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves all education levels in the specified language.
     *
     * @param language The language to localize the education level.
     * @returns An array of localized education level objects.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getLocalizedEducationLevels(language: Language): Promise<readonly LocalizedEducationLevel[]> {
      const educationLevels = await this.getEducationLevels();
      return educationLevels.map((level) => ({
        id: level.id,
        name: language === 'en' ? level.nameEn : level.nameFr,
      }));
    },

    /**
     * * Retrieves a single education level by its name in English or French.
     *
     * @param id The ID of the education level to retrieve.
     * @param language The language to localize the education level to
     * @returns The localized education level object if found.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getLocalizedEducationLevelById(id: string, language: Language): Promise<LocalizedEducationLevel | undefined> {
      const localizedLevels = await this.getLocalizedEducationLevels(language);
      return localizedLevels.find((l) => l.id === id);
    },
  };
}
