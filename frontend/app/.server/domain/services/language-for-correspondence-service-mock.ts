import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import type { LanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import esdcLanguageOfCorrespondenceData from '~/.server/resources/preferredLanguageForCorrespondence.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return {
    getLanguagesOfCorrespondence: () => Promise.resolve(getLanguagesOfCorrespondence()),
    getLanguageOfCorrespondenceById: (id) => Promise.resolve(getLanguageOfCorrespondenceById(id)),
    getLocalizedLanguageOfCorrespondence: (language) => Promise.resolve(getLocalizedLanguageOfCorrespondence(language)),
    getLocalizedLanguageOfCorrespondenceById: (id, language) =>
      Promise.resolve(getLocalizedLanguageOfCorrespondenceById(id, language)),
  };
}

/**
 * Retrieves a list of languages of correspondence.
 *
 * @returns An array of language of correspondence objects.
 */
function getLanguagesOfCorrespondence(): readonly LanguageOfCorrespondence[] {
  return esdcLanguageOfCorrespondenceData.content.map((option) => ({
    id: option.id.toString(),
    nameEn: option.nameEn,
    nameFr: option.nameFr,
  }));
}

/**
 * Retrieves a single language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @returns The language of correspondence object if found.
 * @throws {AppError} If the language of correspondence is not found.
 */
function getLanguageOfCorrespondenceById(id: string): LanguageOfCorrespondence {
  const languagesOfCorrespondence = getLanguagesOfCorrespondence().find((l) => l.id === id);
  if (!languagesOfCorrespondence) {
    throw new AppError(`Language of correspondence with ID '${id}' not found.`, ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND);
  }
  return languagesOfCorrespondence;
}

/**
 * Retrieves a list of languages of correspondence localized to the specified language.
 *
 * @param language The language to localize the language names to.
 * @returns An array of localized language of correspondence objects.
 */
function getLocalizedLanguageOfCorrespondence(language: Language): LocalizedLanguageOfCorrespondence[] {
  return getLanguagesOfCorrespondence().map((option) => ({
    id: option.id,
    name: language === 'fr' ? option.nameFr : option.nameEn,
  }));
}

/**
 * Retrieves a single localized language of correspondence by its ID.
 *
 * @param id The ID of the language of correspondence to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized language of correspondence object if found.
 * @throws {AppError} If the language of correspondence is not found.
 */
function getLocalizedLanguageOfCorrespondenceById(id: string, language: Language): LocalizedLanguageOfCorrespondence {
  const languagesOfCorrespondence = getLocalizedLanguageOfCorrespondence(language).find((l) => l.id === id);
  if (!languagesOfCorrespondence) {
    throw new AppError(
      `Localized language of correspondence with ID '${id}' not found.`,
      ErrorCodes.NO_LANGUAGE_OF_CORRESPONDENCE_FOUND,
    );
  }
  return languagesOfCorrespondence;
}
