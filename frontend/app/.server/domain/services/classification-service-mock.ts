import type { Result, Option } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { Classification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import esdcClassificationData from '~/.server/resources/classification.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockClassificationService(): ClassificationService {
  return {
    getAll: () => Promise.resolve(getAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
  };
}

/**
 * Retrieves a list of all esdc classification groups and levels.
 *
 * @returns An array of esdc classification objects.
 */
function getAll(): Result<readonly Classification[], AppError> {
  const classifications: Classification[] = esdcClassificationData.content.map((classification) => ({
    id: classification.id.toString(),
    name: classification.name,
  }));

  return Ok(classifications);
}

/**
 * Retrieves a single esdc classification group and level by its ID.
 *
 * @param id The ID of the esdc classification to retrieve.
 * @returns The esdc classification object if found or {AppError} If the esdc classification is not found.
 */
function getById(id: string): Result<Classification, AppError> {
  const result = getAll();

  if (result.isErr()) {
    return result;
  }

  const classifications = result.unwrap();
  const classification = classifications.find((p) => p.id === id);

  return classification
    ? Ok(classification)
    : Err(new AppError(`Classification with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND));
}

/**
 * Retrieves a single esdc classification group and level by its ID.
 *
 * @param id The ID of the esdc classification to retrieve.
 * @returns The esdc classification object if found or undefined if not found.
 */
function findById(id: string): Option<Classification> {
  const result = getAll();

  if (result.isErr()) {
    return None;
  }

  const classifications = result.unwrap();
  const classification = classifications.find((p) => p.id === id);

  return classification ? Some(classification) : None;
}
