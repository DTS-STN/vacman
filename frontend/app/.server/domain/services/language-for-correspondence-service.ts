import type { Result, Option } from 'oxide.ts';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import { getDefaultLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-default';
import { getMockLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type LanguageForCorrespondenceService = {
  listAll(): Promise<readonly LanguageOfCorrespondence[]>;
  getById(id: number): Promise<Result<LanguageOfCorrespondence, AppError>>;
  findById(id: number): Promise<Option<LanguageOfCorrespondence>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedLanguageOfCorrespondence[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedLanguageOfCorrespondence>>;
};

export function getLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockLanguageForCorrespondenceService()
    : getDefaultLanguageForCorrespondenceService();
}
