import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import employmentTenureData from '~/.server/resources/employmentTenure.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockEmploymentTenureService(): EmploymentTenureService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getAllLocalized: (language: Language) => Promise.resolve(getAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
  };
}

/**
 * Retrieves a list of all employment tenures.
 *
 * @returns An array of employment tenure objects.
 */
function getAll(): Result<readonly EmploymentTenure[], AppError> {
  const employmentTenures: EmploymentTenure[] = employmentTenureData.content.map((employmentTenure) => ({
    id: employmentTenure.id.toString(),
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));

  return Ok(employmentTenures);
}

/**
 * Retrieves a single employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @returns The employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getById(id: string): Result<EmploymentTenure, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const employmentTenures = result.unwrap();
  const employmentTenure = employmentTenures.find((p) => p.id === id);

  return employmentTenure
    ? Ok(employmentTenure)
    : Err(new AppError(`Employment Tenure with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
}

/**
 * Retrieves a single employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @returns The employment tenure object if found or undefined if not found.
 */
function findById(id: string): Option<EmploymentTenure> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }
  const employmentTenures = result.unwrap();
  const employmentTenure = employmentTenures.find((p) => p.id === id);

  return employmentTenure ? Some(employmentTenure) : None;
}

/**
 * Retrieves a list of employment tenures localized to the specified language.
 *
 * @param language The language to localize the employment tenures to.
 * @returns An array of localized employment tenure objects.
 */
function getAllLocalized(language: Language): Result<readonly LocalizedEmploymentTenure[], AppError> {
  return getAll().map((employmentTenures) =>
    employmentTenures.map((employmentTenure) => ({
      id: employmentTenure.id,
      name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
    })),
  );
}

/**
 * Retrieves a single localized employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @param language The language to localize the employment tenure name to.
 * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedEmploymentTenure, AppError> {
  return getAllLocalized(language).andThen((employmentTenures) => {
    const employmentTenure = employmentTenures.find((b) => b.id === id);

    return employmentTenure
      ? Ok(employmentTenure)
      : Err(new AppError(`Localized Employment Tenure with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
  });
}
