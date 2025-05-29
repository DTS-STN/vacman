import type { ClassificationGroup, ClassificationLevel } from '~/.server/domain/models';
import { getDefaultClassificationService } from '~/.server/domain/services/classification-service-default';
import { getMockClassificationService } from '~/.server/domain/services/classification-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type ClassificationService = {
  getClassificationGroups(): Promise<readonly ClassificationGroup[]>;
  getClassificationGroupById(id: string): Promise<ClassificationGroup | undefined>;
  getClassificationLevelByClassificationGroup(
    classificationGroupId: string,
  ): Promise<readonly ClassificationLevel[] | undefined>;
  getClassificationLevelById(
    classificationGroupId: string,
    classificationLevelId: string,
  ): Promise<ClassificationLevel | undefined>;
};

export function getClassificationService(): ClassificationService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockClassificationService()
    : getDefaultClassificationService();
}
