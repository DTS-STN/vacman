import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import educationLevel from '~/.server/resources/educationLevel.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

/**
 *  Retrieves a list of all education levels.
 *
 * @returns An array of education level objects.
 */
export function getEducationLevels(): readonly EducationLevel[] {
  return educationLevel.content.map((level) => ({
    id: level.id.toString(),
    nameEn: level.nameEn,
    nameFr: level.nameFr,
  }));
}

/**
 * Retrieves a single education level by its ID.
 *
 * @param id The ID of the education level to retrieve.
 * @returns The education level object if found.
 * @throws {AppError} If the education level is not found.
 */
export function getEducationLevelById(id: string): EducationLevel {
  const level = getEducationLevels().find((l) => l.id === id);
  if (!level) {
    throw new AppError(`Education level with ID '${id}' not found.`, ErrorCodes.NO_EDUCATION_LEVEL_FOUND);
  }
  return level;
}

/**
 * Retrieves all education levels in the specified language.
 *
 * @param language The language to localize the education level.
 * @returns An array of localized education level objects.
 */
export function getLocalizedEducationLevels(language: Language): readonly LocalizedEducationLevel[] {
  return getEducationLevels().map((level) => ({
    id: level.id,
    name: language === 'en' ? level.nameEn : level.nameFr,
  }));
}

/**
 * * Retrieves a single education level by its name in English or French.
 *
 * @param id The ID of the education level to retrieve.
 * @param language The language to localize the education level to
 * @returns The localized education level object if found.
 * @throws {AppError} If the education level is not found.
 */
export function getLocalizedEducationLevelById(id: string, language: Language): LocalizedEducationLevel {
  const level = getLocalizedEducationLevels(language).find((l) => l.id === id);
  if (!level) {
    throw new AppError(`Education level with ID '${id}' not found.`, ErrorCodes.NO_EDUCATION_LEVEL_FOUND);
  }
  return level;
}
