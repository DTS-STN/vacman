import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import { getDefaultLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-default';
import { getMockLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type LanguageForCorrespondenceService = {
  getLanguagesOfCorrespondence(): Promise<readonly LanguageOfCorrespondence[]>;
  getLanguageOfCorrespondenceById(id: string): Promise<LanguageOfCorrespondence | undefined>;
  getLocalizedLanguageOfCorrespondence(language: Language): Promise<readonly LocalizedLanguageOfCorrespondence[]>;
  getLocalizedLanguageOfCorrespondenceById(
    id: string,
    language: Language,
  ): Promise<LocalizedLanguageOfCorrespondence | undefined>;
};

export function getLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockLanguageForCorrespondenceService()
    : getDefaultLanguageForCorrespondenceService();
}
