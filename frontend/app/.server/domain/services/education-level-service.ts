import type { EducationLevel, LocalizedEducationLevel } from '~/.server/domain/models';
import { getDefaultEducationLevelService } from '~/.server/domain/services/education-level-service-default';
import { getMockEducationLevelService } from '~/.server/domain/services/education-level-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type EducationLevelService = {
  getEducationLevels(): Promise<readonly EducationLevel[]>;
  getEducationLevelById(id: string): Promise<EducationLevel | undefined>;
  getLocalizedEducationLevels(language: Language): Promise<readonly LocalizedEducationLevel[]>;
  getLocalizedEducationLevelById(id: string, language: Language): Promise<LocalizedEducationLevel | undefined>;
};

export function getEducationLevelService(): EducationLevelService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockEducationLevelService()
    : getDefaultEducationLevelService();
}
