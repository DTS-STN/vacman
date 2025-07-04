import type { Result, Option } from 'oxide.ts';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import { getDefaultLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-default';
import { getMockLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type LanguageForCorrespondenceService = {
  getAll(): Promise<Result<readonly LanguageOfCorrespondence[], AppError>>;
  getById(id: string): Promise<Result<LanguageOfCorrespondence, AppError>>;
  findById(id: string): Promise<Option<LanguageOfCorrespondence>>;
  getByCode(code: string): Promise<Result<LanguageOfCorrespondence, AppError>>;
  findByCode(code: string): Promise<Option<LanguageOfCorrespondence>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedLanguageOfCorrespondence[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedLanguageOfCorrespondence>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageOfCorrespondence, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageOfCorrespondence>>;
};

export function getLanguageForCorrespondenceService(): LanguageForCorrespondenceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockLanguageForCorrespondenceService()
    : getDefaultLanguageForCorrespondenceService();
}
