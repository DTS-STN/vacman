import type { CurrentWFAStatus, LocalizedCurrentWFAStatus } from '~/.server/domain/models';
import type { CurrentWFAStatusService } from '~/.server/domain/services/current-wfa-status-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultCurrentWFAStatusService(): CurrentWFAStatusService {
  return {
    /**
     * Retrieves all current WFA statuses.
     *
     * @returns An array of current WFA status objects.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getCurrentWFAStatuses(): Promise<readonly CurrentWFAStatus[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/current-wfa-statuses`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Current WFA Statuses. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a current WFA status by its ID.
     *
     * @param id The ID of the current WFA status to retrieve.
     * @returns A current WFA status object or undefined if the current WFA status is not found.
     * @throws {AppError} If the server responds with an error status.
     */
    async getCurrentWFAStatusById(id: string): Promise<CurrentWFAStatus | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/current-wfa-statuses/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Current WFA Status with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves all current WFA statuses in the specified language.
     *
     * @param language The language to localize the current WFA statuses.
     * @returns An array of localized current WFA status objects.
     * @throws {AppError} if the request fails or if the server responds with an error status.
     */
    async getLocalizedCurrentWFAStatuses(language: Language): Promise<readonly LocalizedCurrentWFAStatus[]> {
      const currentWFAStatuses = await this.getCurrentWFAStatuses();
      return currentWFAStatuses.map((status) => ({
        id: status.id,
        name: language === 'en' ? status.nameEn : status.nameFr,
      }));
    },

    /**
     * Retrieves a single current WFA status by its ID in the specified language.
     * @param id The ID of the current WFA status to retrieve.
     * @param language The language to localize the current WFA status.
     * @returns A localized current WFA status object, or undefined if not found.
     */
    async getLocalizedCurrentWFAStatusById(id: string, language: Language): Promise<LocalizedCurrentWFAStatus | undefined> {
      const currentWFAStatuses = await this.getLocalizedCurrentWFAStatuses(language);
      return currentWFAStatuses.find((s) => s.id === id);
    },
  };
}
