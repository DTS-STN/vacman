import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import type { LanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import languageReferralTypeData from '~/.server/resources/languageReferralType.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockLanguageReferralType(): LanguageReferralTypeService {
  return {
    listAll: () => Promise.resolve(listAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all language referral types.
 *
 * @returns A promise that resolves to an array of language referral type objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): LanguageReferralType[] {
  const languages: LanguageReferralType[] = languageReferralTypeData.content.map((language) => ({
    id: language.id.toString(),
    code: language.code,
    nameEn: language.nameEn,
    nameFr: language.nameFr,
  }));
  return languages;
}

/**
 * Retrieves a single language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @returns The language referral type object if found or {AppError} If the language referral type is not found.
 */
function getById(id: string): Result<LanguageReferralType, AppError> {
  const result = listAll();
  const languageReferralType = result.find((p) => p.id === id);

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
  const result = getById(id);
  return result.ok();
}

/**
 * Retrieves a single language referral type by its CODE.
 *
 * @param code The CODE of the language referral type to retrieve.
 * @returns The language referral type object if found or {AppError} If the language referral type is not found.
 */
function getByCode(code: string): Result<LanguageReferralType, AppError> {
  const result = listAll();
  const languageReferralType = result.find((p) => p.code === code);

  return languageReferralType
    ? Ok(languageReferralType)
    : Err(new AppError(`Language Referral Type with CODE '${code}' not found.`, ErrorCodes.NO_LANGUAGE_REFERRAL_TYPE_FOUND));
}

/**
 * Retrieves a single language referral type by its CODE.
 *
 * @param code The CODE of the language referral type to retrieve.
 * @returns The language referral type object if found or undefined if not found.
 */
function findByCode(code: string): Option<LanguageReferralType> {
  const result = getByCode(code);
  return result.ok();
}

/**
 * Retrieves a list of all language referral types, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized language referral type objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedLanguageReferralType[] {
  return listAll().map((languageReferralType) => ({
    id: languageReferralType.id,
    code: languageReferralType.code,
    name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
  }));
}

/**
 * Retrieves a single localized language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language referral type object if found or {AppError} If the language referral type is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedLanguageReferralType, AppError> {
  const result = getById(id);
  return result.map((languageReferralType) => ({
    id: languageReferralType.id,
    code: languageReferralType.code,
    name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
  }));
}

/**
 * Retrieves a single localized language referral type by its ID.
 *
 * @param id The ID of the language referral type to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized language referral type object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedLanguageReferralType> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized language referral type by its CODE.
 *
 * @param code The CODE of the language referral type to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language referral type object if found or {AppError} If the language referral type is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedLanguageReferralType, AppError> {
  const result = getByCode(code);
  return result.map((languageReferralType) => ({
    id: languageReferralType.id,
    code: languageReferralType.code,
    name: language === 'fr' ? languageReferralType.nameFr : languageReferralType.nameEn,
  }));
}

/**
 * Retrieves a single localized language referral type by its CODE.
 *
 * @param code The CODE of the language referral type to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized language referral type object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedLanguageReferralType> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
