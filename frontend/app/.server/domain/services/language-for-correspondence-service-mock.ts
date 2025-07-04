import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import esdcLanguageOfCorrespondenceData from '~/.server/resources/preferredLanguageForCorrespondence.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of languages of correspondence.
 *
 * @returns An array of language of correspondence objects.
 */
function getAll(): Result<readonly LanguageOfCorrespondence[], AppError> {
  const languages: LanguageOfCorrespondence[] = esdcLanguageOfCorrespondenceData.content.map((option) => ({
    id: option.id.toString(),
    code: option.code,
    nameEn: option.nameEn,
    nameFr: option.nameFr,
  }));

  return Ok(languages);
}

/**
 * Retrieves a single language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @returns The language of correspondence object if found or {AppError} If the language of correspondence is not found.
 */
function getById(id: string): Result<LanguageOfCorrespondence, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((l) => l.id === id);

  return languageOfCorrespondence
    ? Ok(languageOfCorrespondence)
    : Err(
        new AppError(`Language of correspondence with ID '${id}' not found.`, ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND),
      );
}

/**
 * Retrieves a single language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @returns The language of correspondence object if found or undefined if not found.
 */
function findById(id: string): Option<LanguageOfCorrespondence> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }

  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((l) => l.id === id);

  return languageOfCorrespondence ? Some(languageOfCorrespondence) : None;
}

/**
 * Retrieves a single language of correspondence by its CODE.
 *
 * @param code The CODE of the language of correspondence to retrieve.
 * @returns The language of correspondence object if found or {AppError} If the language of correspondence is not found.
 */
function getByCode(code: string): Result<LanguageOfCorrespondence, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((l) => l.code === code);

  return languageOfCorrespondence
    ? Ok(languageOfCorrespondence)
    : Err(
        new AppError(
          `Language of correspondence with CODE '${code}' not found.`,
          ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
        ),
      );
}

/**
 * Retrieves a single language of correspondence by its CODE.
 *
 * @param code The CODE of the language of correspondence to retrieve.
 * @returns The language of correspondence object if found or undefined if not found.
 */
function findByCode(code: string): Option<LanguageOfCorrespondence> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }

  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((l) => l.code === code);

  return languageOfCorrespondence ? Some(languageOfCorrespondence) : None;
}

/**
 * Retrieves a list of languages of correspondence localized to the specified language.
 *
 * @param language The language to localize the language names to.
 * @returns An array of localized language of correspondence objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedLanguageOfCorrespondence[], AppError> {
  return getAll().map((options) =>
    options
      .map((option) => ({
        id: option.id,
        code: option.code,
        name: language === 'fr' ? option.nameFr : option.nameEn,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, language, { sensitivity: 'base' })),
  );
}

/**
 * Retrieves a single localized language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language of correspondence object if found or {AppError} If the language of correspondence is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedLanguageOfCorrespondence, AppError> {
  return getAllLocalized(language).andThen((languagesOfCorrespondence) => {
    const languageOfCorrespondence = languagesOfCorrespondence.find((b) => b.id === id);

    return languageOfCorrespondence
      ? Ok(languageOfCorrespondence)
      : Err(
          new AppError(
            `Localized language of correspondence with ID '${id}' not found.`,
            ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
          ),
        );
  });
}

/**
 * Retrieves a single localized language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @param language The language to localize the language of correspondence name to.
 * @returns The localized language of correspondence object if found or undefined If the language of correspondence is not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedLanguageOfCorrespondence> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((p) => p.id === id);

  return languageOfCorrespondence ? Some(languageOfCorrespondence) : None;
}

/**
 * Retrieves a single localized language of correspondence by its CODE.
 *
 * @param code The CODE of the language of correspondence to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language of correspondence object if found or {AppError} If the language of correspondence is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedLanguageOfCorrespondence, AppError> {
  return getAllLocalized(language).andThen((languagesOfCorrespondence) => {
    const languageOfCorrespondence = languagesOfCorrespondence.find((b) => b.code === code);

    return languageOfCorrespondence
      ? Ok(languageOfCorrespondence)
      : Err(
          new AppError(
            `Localized language of correspondence with CODE '${code}' not found.`,
            ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
          ),
        );
  });
}

/**
 * Retrieves a single localized language of correspondence by its CODE.
 *
 * @param code The CODE of the language of correspondence to retrieve.
 * @param language The language to localize the language of correspondence name to.
 * @returns The localized language of correspondence object if found or undefined If the language of correspondence is not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedLanguageOfCorrespondence> {
  const result = getAllLocalized(language);

  if (result.isErr()) {
    return None;
  }
  const languagesOfCorrespondence = result.unwrap();
  const languageOfCorrespondence = languagesOfCorrespondence.find((p) => p.code === code);

  return languageOfCorrespondence ? Some(languageOfCorrespondence) : None;
}
