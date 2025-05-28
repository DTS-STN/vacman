import type { LocalizedOpportunityType, OpportunityType } from '~/.server/domain/models';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultOpportunityTypeService() {
  return {
    /**
     * Retrieves all employment opportunity types.
     *
     * @returns An array of all opportunity types.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getOpportunityTypes(): Promise<readonly OpportunityType[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/opportunity-types`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all Opportunity Types. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a single employment opportunity type by its ID.
     *
     * @param id The ID of the opportunity type to retrieve.
     * @returns The opportunity type object if found.
     * @throws {AppError} If the opportunity type is not found or if the request fails or if the server responds with an error status.
     */
    async getOpportunityTypeById(id: string): Promise<OpportunityType | undefined> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/opportunity-types/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return undefined;
      }

      if (!response.ok) {
        const errorMessage = `Failed to find the Opportunity Type with ID '${id}'. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves all employment opportunity types in the specified language.
     *
     * @param language The language to localize the opportunity name to.
     * @returns An array of localized opportunity types, with names in the specified language.
     * @throws {AppError} If the request fails or if the server responds with an error status.
     */
    async getLocalizedOpportunityTypes(language: Language): Promise<readonly LocalizedOpportunityType[]> {
      const response = await getDefaultOpportunityTypeService().getOpportunityTypes();
      return response.map((option) => ({
        id: option.id,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }));
    },

    /**
     * Retrieves a single localized employment opportunity type by its ID.
     *
     * @param id The ID of the opportunity type to retrieve.
     * @param language The language to localize the opportunity type name to
     * @returns The localized opportunity type object if found.
     * @throws {AppError} If the request fails or if the server responds with an error status.
     */
    async getLocalizedOpportunityTypeById(id: string, language: Language): Promise<LocalizedOpportunityType | undefined> {
      const response = await getDefaultOpportunityTypeService().getLocalizedOpportunityTypes(language);
      return response.find((l) => l.id === id);
    },
  };
}
