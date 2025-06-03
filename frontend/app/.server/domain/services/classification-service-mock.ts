import type { Classification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import esdcClassificationData from '~/.server/resources/classification.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockClassificationService(): ClassificationService {
  return {
    getClassifications: () => Promise.resolve(getClassifications()),
    getClassificationById: (id: string) => Promise.resolve(getClassificationById(id)),
  };
}

/**
 * Retrieves a list of all esdc classification groups and levels.
 *
 * @returns An array of esdc classification objects.
 */
function getClassifications(): readonly Classification[] {
  return esdcClassificationData.content.map((classification) => ({
    id: classification.id.toString(),
    name: classification.name,
  }));
}

/**
 * Retrieves a single esdc classification group and level by its ID.
 *
 * @param id The ID of the esdc classification to retrieve.
 * @returns The esdc classification object if found.
 * @throws {AppError} If the esdc classification is not found.
 */
function getClassificationById(id: string): Classification {
  const classification = getClassifications().find((cg) => cg.id === id);
  if (!classification) {
    throw new AppError(`Classification with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_FOUND);
  }
  return classification;
}
