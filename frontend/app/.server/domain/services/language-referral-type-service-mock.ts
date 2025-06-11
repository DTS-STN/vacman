import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import languageReferralTypeData from '~/.server/resources/languageReferralType.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockLanguageReferralType(): LanguageReferralTypeService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
  };
}
/**
 * Retrieves a list of language referral types.
 *
 * @returns An array of language referral type objects.
 */
function getAll(): Result<readonly LanguageReferralType[], AppError> {
  const languages: LanguageReferralType[] = languageReferralTypeData.content.map((language) => ({
    id: language.id.toString(),
    nameEn: language.nameEn,
    nameFr: language.nameFr,
  }));

  return Ok(languages);
}

/**
 * Retrieves a single language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @returns The language referral type object if found or {AppError} If the language referral type is not found.
 */
function getById(id: string): Result<LanguageReferralType, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const languages = result.unwrap();
  const languageReferralType = languages.find((p) => p.id === id);

  return languageReferralType
    ? Ok(languageReferralType)
    : Err(new AppError(`Language Referral Type with ID '${id}' not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
}

/**
 * Retrieves a single language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @returns The language referral type object if found or undefined if not found.
 */
function findById(id: string): Option<LanguageReferralType> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }

  const languageReferralTypes = result.unwrap();
  const languageReferralType = languageReferralTypes.find((p) => p.id === id);

  return languageReferralType ? Some(languageReferralType) : None;
}

/**
 * Retrieves a list of language referral type localized to the specified language.
 *
 * @param language The language to localize the language names to.
 * @returns An array of localized language referral type objects.
 */
function getAllLocalized(language: Language): Result<LocalizedLanguageReferralType[], AppError> {
  return getAll().map((languageReferralTypes) =>
    languageReferralTypes.map((languageReferralType) => ({
      id: languageReferralType.id,
      name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
    })),
  );
}

/**
 * Retrieves a single localized language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language referral type object if found or {AppError} If the language referral type is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedLanguageReferralType, AppError> {
  return getAllLocalized(language).andThen((languageReferralTypes) => {
    const languageReferralType = languageReferralTypes.find((b) => b.id === id);

    return languageReferralType
      ? Ok(languageReferralType)
      : Err(
          new AppError(
            `Localized Language Referral Type with ID '${id}' not found.`,
            ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND,
          ),
        );
  });
}
