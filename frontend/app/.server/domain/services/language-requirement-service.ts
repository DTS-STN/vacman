import type { Result, Option } from 'oxide.ts';

import type { LanguageRequirement, LocalizedLanguageRequirement } from '~/.server/domain/models';
import { getDefaultLanguageRequirementService } from '~/.server/domain/services/language-requirement-service-default';
import { getMockLanguageRequirementService } from '~/.server/domain/services/language-requirement-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type LanguageRequirementService = {
  listAll(): Promise<readonly LanguageRequirement[]>;
  getById(id: number): Promise<Result<LanguageRequirement, AppError>>;
  getByCode(code: string): Promise<Result<LanguageRequirement, AppError>>;
  findById(id: number): Promise<Option<LanguageRequirement>>;
  findByCode(code: string): Promise<Option<LanguageRequirement>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedLanguageRequirement[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedLanguageRequirement, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedLanguageRequirement>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageRequirement, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageRequirement>>;
};

export function getLanguageRequirementService(): LanguageRequirementService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockLanguageRequirementService()
    : getDefaultLanguageRequirementService();
}
