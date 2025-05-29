import type { LanguageProfileForReferral, LocalizedLanguageProfileForReferral } from '~/.server/domain/models';
import type { LanguageProfileForReferralService } from '~/.server/domain/services/language-profile-for-referral-service';
import languageProfileForReferralData from '~/.server/resources/languageProfileForReferral.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockLanguageProfileForReferral(): LanguageProfileForReferralService {
  return {
    getLanguagesProfileForReferral: () => Promise.resolve(getLanguagesProfileForReferral()),
    getLanguageProfileForReferralById: (id) => Promise.resolve(getLanguageProfileForReferralById(id)),
    getLocalizedLanguageProfileForReferral: (language) => Promise.resolve(getLocalizedLanguageProfileForReferral(language)),
    getLocalizedLanguageProfileForReferralById: (id, language) =>
      Promise.resolve(getLocalizedLanguageProfileForReferralById(id, language)),
  };
}
/**
 * Retrieves a list of languages profile for referral.
 *
 * @returns An array of language profile for referral objects.
 */
function getLanguagesProfileForReferral(): readonly LanguageProfileForReferral[] {
  return languageProfileForReferralData.content.map((language) => ({
    id: language.id.toString(),
    nameEn: language.nameEn,
    nameFr: language.nameFr,
  }));
}

/**
 * Retrieves a single languages profile for referral by its ID.
 *
 * @param id The ID of the languages profile for referral to retrieve.
 * @returns The languages profile for referral object if found.
 * @throws {AppError} If the languages profile for referral is not found.
 */
function getLanguageProfileForReferralById(id: string): LanguageProfileForReferral {
  const languageProfileForReferral = getLanguagesProfileForReferral().find((l) => l.id === id);
  if (!languageProfileForReferral) {
    throw new AppError(
      `Languages profile for referral with ID '${id}' not found.`,
      ErrorCodes.NO_LANGUAGE_PROFILE_FOR_REFERRAL_FOUND,
    );
  }
  return languageProfileForReferral;
}

/**
 * Retrieves a list of languages profile for referral localized to the specified language.
 *
 * @param language The language to localize the language names to.
 * @returns An array of localized languages profile for referral objects.
 */
function getLocalizedLanguageProfileForReferral(language: Language): LocalizedLanguageProfileForReferral[] {
  return getLanguagesProfileForReferral().map((option) => ({
    id: option.id,
    name: language === 'fr' ? option.nameFr : option.nameEn,
  }));
}

/**
 * Retrieves a single localized languages profile for referral by its ID.
 *
 * @param id The ID of the languages profile for referral to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized languages profile for referral object if found.
 * @throws {AppError} If the languages profile for referral is not found.
 */
function getLocalizedLanguageProfileForReferralById(id: string, language: Language): LocalizedLanguageProfileForReferral {
  const languageProfileForReferral = getLocalizedLanguageProfileForReferral(language).find((l) => l.id === id);
  if (!languageProfileForReferral) {
    throw new AppError(
      `Localized languages profile for referral with ID '${id}' not found.`,
      ErrorCodes.NO_LANGUAGE_PROFILE_FOR_REFERRAL_FOUND,
    );
  }
  return languageProfileForReferral;
}
