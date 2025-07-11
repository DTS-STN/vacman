import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { Classification, LocalizedClassification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import esdcClassificationData from '~/.server/resources/classification.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockClassificationService(): ClassificationService {
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
Retrieves a list of all esdc classification groups and levels.
 *
 * @returns An array of esdc classification objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): Classification[] {
  const classifications: Classification[] = esdcClassificationData.content.map((classification) => ({
    id: classification.id.toString(),
    code: classification.name,
    nameEn: classification.name,
    nameFr: classification.name,
  }));
  return classifications;
}

/**
 * Retrieves a single esdc classification group and level by its ID.
 *
 * @param id The ID of the esdc classification to retrieve.
 * @returns The esdc classification object if found or {AppError} If the esdc classification is not found.
 */
function getById(id: string): Result<Classification, AppError> {
  const result = listAll();
  const classification = result.find((p) => p.id === id);

  return classification
    ? Ok(classification)
    : Err(new AppError(`Classification with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND));
}

/**
 * Retrieves a single classification by its CODE.
 *
 * @param code The CODE of the classification to retrieve.
 * @returns The classification object if found or {AppError} If the classification is not found.
 */
function getByCode(code: string): Result<Classification, AppError> {
  const result = listAll();
  const classification = result.find((p) => p.code === code);

  return classification
    ? Ok(classification)
    : Err(new AppError(`Classification with CODE '${code}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND));
}

/**
 * Retrieves a list of all classification, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized classification objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedClassification[] {
  return listAll().map((classification) => ({
    id: classification.id,
    code: classification.code,
    name: language === 'fr' ? classification.nameFr : classification.nameEn,
  }));
}

/**
 * Retrieves a single localized classification by its ID.
 *
 * @param id The ID of the classification to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized classification object if found or {AppError} If the classification is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedClassification, AppError> {
  const result = getById(id);
  return result.map((classification) => ({
    id: classification.id,
    code: classification.code,
    name: language === 'fr' ? classification.nameFr : classification.nameEn,
  }));
}

/**
 * Retrieves a single localized classification by its ID.
 *
 * @param id The ID of the classification to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized classification object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedClassification> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized classification by its CODE.
 *
 * @param code The CODE of the classificatione to retrieve.
 * @param language The language to localize the language name to.
 * @returns The localized classification object if found or {AppError} If the classification is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedClassification, AppError> {
  const result = getByCode(code);
  return result.map((classification) => ({
    id: classification.id,
    code: classification.code,
    name: language === 'fr' ? classification.nameFr : classification.nameEn,
  }));
}

/**
 * Retrieves a single localized classification by its CODE.
 *
 * @param code The CODE of the classification to retrieve.
 * @param language The language to localize the directorate name to.
 * @returns The localized classification object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedClassification> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
