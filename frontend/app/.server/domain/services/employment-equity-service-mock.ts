import { Ok, Err } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type { EmploymentEquity, LocalizedEmploymentEquity } from '~/.server/domain/models';
import type { EmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import employmentEquityData from '~/.server/resources/employmentEquity.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockEmploymentEquityService(): EmploymentEquityService {
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
 * Retrieves a list of all employment equity codes.
 *
 * @returns A promise that resolves to an array of employment equity objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): EmploymentEquity[] {
  const employmentEquities: EmploymentEquity[] = employmentEquityData.content.map((employmentEquity) => ({
    id: employmentEquity.id.toString(),
    code: employmentEquity.code,
    nameEn: employmentEquity.nameEn,
    nameFr: employmentEquity.nameFr,
  }));
  return employmentEquities;
}

/**
 * Retrieves a single employment equity by its ID.
 *
 * @param id The ID of the employment equity to retrieve.
 * @returns The employment equity object if found or {AppError} If the employment equity is not found.
 */
function getById(id: string): Result<EmploymentEquity, AppError> {
  const result = listAll();
  const employmentEquity = result.find((p) => p.id === id);

  return employmentEquity
    ? Ok(employmentEquity)
    : Err(new AppError(`Employment Equity with ID '${id}' not found.`, ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND));
}

/**
 * Retrieves a single employment equity by its ID.
 *
 * @param id The ID of the employment equity to retrieve.
 * @returns The employment equity object if found or undefined if not found.
 */
function findById(id: string): Option<EmploymentEquity> {
  const result = getById(id);
  return result.ok();
}

/**
 * Retrieves a single employment equity by its CODE.
 *
 * @param code The CODE of the employment equity to retrieve.
 * @returns The employment equity object if found or {AppError} If the employment equity is not found.
 */
function getByCode(code: string): Result<EmploymentEquity, AppError> {
  const result = listAll();
  const employmentEquity = result.find((p) => p.code === code);

  return employmentEquity
    ? Ok(employmentEquity)
    : Err(new AppError(`Employment Equity with CODE '${code}' not found.`, ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND));
}

/**
 * Retrieves a single employment equity by its CODE.
 *
 * @param code The CODE of the employment equity to retrieve.
 * @returns The employment equity object if found or undefined if not found.
 */
function findByCode(code: string): Option<EmploymentEquity> {
  const result = getByCode(code);
  return result.ok();
}

/**
 * Retrieves a list of all employment equity codes, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized employment equity objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedEmploymentEquity[] {
  return listAll().map((employmentEquity) => ({
    id: employmentEquity.id,
    code: employmentEquity.code,
    name: language === 'fr' ? employmentEquity.nameFr : employmentEquity.nameEn,
  }));
}

/**
 * Retrieves a single localized employment equity by its ID.
 *
 * @param id The ID of the employment equity to retrieve.
 * @param language The language to localize the employment equity name to.
 * @returns The localized employment equity object if found or {AppError} If the employment equity is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedEmploymentEquity, AppError> {
  const result = getById(id);
  return result.map((employmentEquity) => ({
    id: employmentEquity.id,
    code: employmentEquity.code,
    name: language === 'fr' ? employmentEquity.nameFr : employmentEquity.nameEn,
  }));
}

/**
 * Retrieves a single localized employment equity by its ID.
 *
 * @param id The ID of the employment equity to retrieve.
 * @param language The language to localize the employment equity name to.
 * @returns The localized employment equity object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedEmploymentEquity> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized employment equity by its CODE.
 *
 * @param code The CODE of the employment equity to retrieve.
 * @param language The language to localize the employment equity name to.
 * @returns The localized employment equity object if found or {AppError} If the employment equity is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedEmploymentEquity, AppError> {
  const result = getByCode(code);
  return result.map((employmentEquity) => ({
    id: employmentEquity.id,
    code: employmentEquity.code,
    name: language === 'fr' ? employmentEquity.nameFr : employmentEquity.nameEn,
  }));
}

/**
 * Retrieves a single localized employment equity by its CODE.
 *
 * @param code The CODE of the employment equity to retrieve.
 * @param language The language to localize the employment equity name to.
 * @returns The localized employment equity object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedEmploymentEquity> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
