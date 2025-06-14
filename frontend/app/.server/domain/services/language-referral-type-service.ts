import type { Result, Option } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import { getDefaultLanguageReferralType } from '~/.server/domain/services/language-referral-type-service-default';
import { getMockLanguageReferralType } from '~/.server/domain/services/language-referral-type-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type LanguageReferralTypeService = {
  getAll(): Promise<Result<readonly LanguageReferralType[], AppError>>;
  getById(id: string): Promise<Result<LanguageReferralType, AppError>>;
  findById(id: string): Promise<Option<LanguageReferralType>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedLanguageReferralType[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>>;
};

export function getLanguageReferralTypeService(): LanguageReferralTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockLanguageReferralType() : getDefaultLanguageReferralType();
}
