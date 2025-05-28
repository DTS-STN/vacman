import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import type { EducationLevelService } from '~/.server/domain/services/education-level-service';
import educationLevel from '~/.server/resources/educationLevel.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockEducationLevelService(): EducationLevelService {
  return {
    getEducationLevels: () => Promise.resolve(getEducationLevels()),
    getEducationLevelById: (id: string) => Promise.resolve(getEducationLevelById(id)),
    getLocalizedEducationLevels: (language: Language) => Promise.resolve(getLocalizedEducationLevels(language)),
    getLocalizedEducationLevelById: (id: string, language: Language) =>
      Promise.resolve(getLocalizedEducationLevelById(id, language)),
  };
}

/**
 *  Retrieves a list of all education levels.
 *
 * @returns An array of education level objects.
 */
function getEducationLevels(): readonly EducationLevel[] {
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
function getEducationLevelById(id: string): EducationLevel {
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
function getLocalizedEducationLevels(language: Language): readonly LocalizedEducationLevel[] {
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
function getLocalizedEducationLevelById(id: string, language: Language): LocalizedEducationLevel {
  const level = getLocalizedEducationLevels(language).find((l) => l.id === id);
  if (!level) {
    throw new AppError(`Education level with ID '${id}' not found.`, ErrorCodes.NO_EDUCATION_LEVEL_FOUND);
  }
  return level;
}
