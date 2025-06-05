import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import type { EducationLevelService } from '~/.server/domain/services/education-level-service';
import educationLevel from '~/.server/resources/educationLevel.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockEducationLevelService(): EducationLevelService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
  };
}

/**
 *  Retrieves a list of all education levels.
 *
 * @returns An array of education level objects.
 */
function getAll(): Result<readonly EducationLevel[], AppError> {
  const levels: EducationLevel[] = educationLevel.content.map((level) => ({
    id: level.id.toString(),
    nameEn: level.nameEn,
    nameFr: level.nameFr,
  }));

  return Ok(levels);
}

/**
 * Retrieves a single education level by its ID.
 *
 * @param id The ID of the education level to retrieve.
 * @returns The education level object if found or {AppError} If the education level is not found.
 */
function getById(id: string): Result<EducationLevel, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const levels = result.unwrap();
  const level = levels.find((l) => l.id === id);

  return level
    ? Ok(level)
    : Err(new AppError(`Education level with ID '${id}' not found.`, ErrorCodes.NO_EDUCATION_LEVEL_FOUND));
}

/**
 * Retrieves a single education level by its ID.
 *
 * @param id The ID of the education level to retrieve.
 * @returns The education level object if found or undefined if not found.
 */
function findById(id: string): Option<EducationLevel> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const levels = result.unwrap();
  const level = levels.find((p) => p.id === id);

  return level ? Some(level) : None;
}

/**
 * Retrieves a list of education levels in the specified language.
 *
 * @param language The language to localize the education level.
 * @returns An array of localized education level objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedEducationLevel[], AppError> {
  return getAll().map((levels) =>
    levels.map((level) => ({
      id: level.id,
      name: language === 'fr' ? level.nameFr : level.nameEn,
    })),
  );
}

/**
 * * Retrieves a single education level by its name in English or French.
 *
 * @param id The ID of the education level to retrieve.
 * @param language The language to localize the education level to
 * @returns The localized education level object if found or AppError If the education level is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedEducationLevel, AppError> {
  return getAllLocalized(language).andThen((levels) => {
    const level = levels.find((b) => b.id === id);

    return level
      ? Ok(level)
      : Err(new AppError(`Education level with ID '${id}' not found.`, ErrorCodes.NO_EDUCATION_LEVEL_FOUND));
  });
}
