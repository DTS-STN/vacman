import type { ClassificationGroup, ClassificationLevel } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import esdcClassificationData from '~/.server/resources/classification.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockClassificationService(): ClassificationService {
  return {
    getClassificationGroups: () => Promise.resolve(getClassificationGroup()),
    getClassificationGroupById: (id: string) => Promise.resolve(getClassificationGroupById(id)),
    getClassificationLevelByClassificationGroup: (classificationGroupId: string) =>
      Promise.resolve(getClassificationLevelByClassificationGroup(classificationGroupId)),
    getClassificationLevelById: (classificationGroupId: string, classificationLevelId: string) =>
      Promise.resolve(getClassificationLevelById(classificationGroupId, classificationLevelId)),
  };
}

/**
 * Retrieves a list of all esdc classification groups.
 *
 * @returns An array of esdc classification group objects.
 */
function getClassificationGroup(): readonly ClassificationGroup[] {
  return esdcClassificationData.content.map((classificationGroup) => ({
    id: classificationGroup.id.toString(),
    name: classificationGroup.name,
    levels: classificationGroup.levels.map((level) => ({
      id: level.id.toString(),
      name: level.name,
    })),
  }));
}

/**
 * Retrieves a single esdc classification group by its ID.
 *
 * @param id The ID of the esdc classification group to retrieve.
 * @returns The esdc classification group object if found.
 * @throws {AppError} If the esdc classification group is not found.
 */
function getClassificationGroupById(id: string): ClassificationGroup {
  const classificationGroup = getClassificationGroup().find((cg) => cg.id === id);
  if (!classificationGroup) {
    throw new AppError(`Classification group with ID '${id}' not found.`, ErrorCodes.NO_CLASSIFICATION_GROUP_FOUND);
  }
  return classificationGroup;
}

/**
 *
 * @param classificationGroupId The ID of the classification group to retrieve levels from.
 * @returns The esdc classification levels associated with the specified classification group.
 */
function getClassificationLevelByClassificationGroup(classificationGroupId: string): readonly ClassificationLevel[] {
  const classificationGroup = getClassificationGroupById(classificationGroupId);
  return classificationGroup.levels.map((level) => ({
    id: level.id,
    name: level.name,
  }));
}

/**
 * Retrieves a single esdc classification level by its ID.
 *
 * @param classificationGroupId The ID of the esdc classification group to retrieve.
 * @param classificationLevelId The ID of the esdc classification level to retrieve.
 * @returns The esdc classification level object associated with the specified classification group if found.
 * @throws {AppError} If the esdc classification level is not found.
 */
function getClassificationLevelById(classificationGroupId: string, classificationLevelId: string): ClassificationLevel {
  const classificationGroup = getClassificationGroupById(classificationGroupId);

  const level = classificationGroup.levels.find((l) => l.id === classificationLevelId);
  if (!level) {
    throw new AppError(
      `Classification level with ID '${classificationLevelId}' not found in group '${classificationGroup.name}'.`,
      ErrorCodes.NO_CLASSIFICATION_LEVEL_FOUND,
    );
  }
  return level;
}
