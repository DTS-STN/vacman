import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { EmploymentTenure, LocalizedEmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import employmentTenureData from '~/.server/resources/employmentTenure.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockEmploymentTenureService(): EmploymentTenureService {
  return {
    listAll: () => Promise.resolve(listAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all employment tenures.
 *
 * @returns A promise that resolves to an array of employment tenures objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): EmploymentTenure[] {
  const employmentTenures: EmploymentTenure[] = employmentTenureData.content.map((employmentTenure) => ({
    id: employmentTenure.id.toString(),
    code: employmentTenure.code,
    nameEn: employmentTenure.nameEn,
    nameFr: employmentTenure.nameFr,
  }));
  return employmentTenures;
}

/**
 * Retrieves a single employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @returns The employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getById(id: string): Result<EmploymentTenure, AppError> {
  const result = listAll();
  const employmentTenure = result.find((p) => p.id === id);

  return employmentTenure
    ? Ok(employmentTenure)
    : Err(new AppError(`Employment Tenure with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
}

/**
 * Retrieves a single employment tenure by its CODE.
 *
 * @param code The CODE of the employment tenure to retrieve.
 * @returns The employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getByCode(code: string): Result<EmploymentTenure, AppError> {
  const result = listAll();
  const employmentTenure = result.find((p) => p.code === code);

  return employmentTenure
    ? Ok(employmentTenure)
    : Err(new AppError(`Employment Tenure with CODE '${code}' not found.`, ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND));
}

/**
 * Retrieves a list of employment tenures localized to the specified language.
 *
 * @param language The language to localize the employment tenures to.
 * @returns An array of localized employment tenure objects
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedEmploymentTenure[] {
  return listAll().map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
  }));
}

/**
 * Retrieves a single localized employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @param language The language to localize the employment tenure name to.
 * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedEmploymentTenure, AppError> {
  const result = getById(id);
  return result.map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
  }));
}

/**
 * Retrieves a single localized employment tenure by its ID.
 *
 * @param id The ID of the employment tenure to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized employment tenure object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedEmploymentTenure> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized employment tenure by its CODE.
 *
 * @param code The CODE of the employment tenure to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized employment tenure object if found or {AppError} If the employment tenure is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedEmploymentTenure, AppError> {
  const result = getByCode(code);
  return result.map((employmentTenure) => ({
    id: employmentTenure.id,
    code: employmentTenure.code,
    name: language === 'fr' ? employmentTenure.nameFr : employmentTenure.nameEn,
  }));
}

/**
 * Retrieves a single localized employment tenure by its CODE.
 *
 * @param code The CODE of the employment tenure to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized employment tenure object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedEmploymentTenure> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
