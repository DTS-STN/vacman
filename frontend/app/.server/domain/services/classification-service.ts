import type { Classification } from '~/.server/domain/models';
import { getDefaultClassificationService } from '~/.server/domain/services/classification-service-default';
import { getMockClassificationService } from '~/.server/domain/services/classification-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type ClassificationService = {
  getClassifications(): Promise<readonly Classification[]>;
  getClassificationById(id: string): Promise<Classification>;
};

export function getClassificationService(): ClassificationService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockClassificationService()
    : getDefaultClassificationService();
}
