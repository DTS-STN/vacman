import type { Directorate, LocalizedDirectorate } from '~/.server/domain/models';
import type { DirectorateService } from '~/.server/domain/services/directorate-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultDirectorateService(): DirectorateService {
  return {
    /**
     * Retrieves a list of all esdc directorates.
     *
     * @returns An array of esdc directorate objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getDirectorates(): Promise<readonly Directorate[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/directorates`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all ESDC Directorate. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single directorate by its ID.
     *
     * @param id The ID of the directorate to retrieve.
     * @returns The directorate object if found.
     * @throws {AppError} If the directorate is not found or if the request fails or if the server responds with an error status.
     */
    async getDirectorateById(id: string): Promise<Directorate | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/directorates/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the ESDC Directorate with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a list of directorates localized to the specified language.
     *
     * @param language The language to localize the branch names to.
     * @returns An array of localized branch objects.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedDirectorates(language: Language): Promise<readonly LocalizedDirectorate[]> {
      const response = await getDefaultDirectorateService().getDirectorates();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },

    /**
     * Retrieves a single localized directorate by its ID.
     *
     * @param id The ID of the directorate to retrieve.
     * @param language The language to localize the directorate name to.
     * @returns The localized directorate object if found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedDirectorateById(id: string, language: Language): Promise<LocalizedDirectorate | undefined> {
      const response = await getDefaultDirectorateService().getLocalizedDirectorates(language);
      return response.find((l) => l.id === id);
    },
  };
}
