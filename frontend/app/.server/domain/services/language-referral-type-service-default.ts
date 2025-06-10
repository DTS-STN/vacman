import type { Result, Option } from 'oxide.ts';
import { Some, None, Ok, Err } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

//TODO: Revisit when the api endpoints are avaialable
export function getDefaultLanguageReferralType(): LanguageReferralTypeService {
  return {
    /**
     * Retrieves a list of language referral types.
     *
     * @returns An array of language referral type objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAll(): Promise<Result<readonly LanguageReferralType[], AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/language-referral-types`);

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to retrieve all Languages. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: LanguageReferralType[] = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(`Unexpected error occurred while fetching Languages: ${String(error)}`, ErrorCodes.VACMAN_API_ERROR),
        );
      }
    },

    /**
     * Retrieves a single language referral type by its ID.
     *
     * @param id The ID of the language referral type to retrieve.
     * @returns The language referral type object if found or {AppError} If the language referral type is not found or if the request fails or if the server responds with an error status.
     */
    async getById(id): Promise<Result<LanguageReferralType, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/language-referral-types/${id}`);

        if (response.status === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Branch with ID '${id}' not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
        }

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to find the Language with ID '${id}'. Server responded with status ${response.status}.`,
              ErrorCodes.VACMAN_API_ERROR,
            ),
          );
        }

        const data: LanguageReferralType = await response.json();
        return Ok(data);
      } catch (error) {
        return Err(
          new AppError(
            `Unexpected error occurred while fetching Language by ID: ${String(error)}`,
            ErrorCodes.VACMAN_API_ERROR,
          ),
        );
      }
    },

    /**
     * Retrieves a single language referral type by its ID.
     *
     * @param id The ID of the language referral type to retrieve.
     * @returns The language referral type object if found or undefined If the language referral type is not found.
     */
    async findById(id: string): Promise<Option<LanguageReferralType>> {
      const result = await getDefaultLanguageReferralType().getAll();

      if (result.isErr()) {
        return None;
      }

      const found = result.unwrap().find((languageReferralType) => languageReferralType.id === id);
      return found ? Some(found) : None;
    },

    /**
     * Retrieves a list of language referral type localized to the specified language.
     *
     * @param language The language to localize the language names to.
     * @returns An array of localized language referral type objects or {AppError} if the request fails or if the server responds with an error status.
     */
    async getAllLocalized(language): Promise<Result<readonly LocalizedLanguageReferralType[], AppError>> {
      const result = await getDefaultLanguageReferralType().getAll();

      return result.map((languageReferralTypes) =>
        languageReferralTypes.map((languageReferralType) => ({
          id: languageReferralType.id,
          name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
        })),
      );
    },

    /**
     * Retrieves a single localized language referral type by its ID.
     *
     * @param id The ID of the language referral type to retrieve.
     * @param language The language to localize the language name to.
     * @returns The localized language referral type object if found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getLocalizedById(id, language): Promise<Result<LocalizedLanguageReferralType, AppError>> {
      const result = await getDefaultLanguageReferralType().getById(id);
      return result.map((languageReferralType) => ({
        id: languageReferralType.id,
        name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
      }));
    },
  };
}
