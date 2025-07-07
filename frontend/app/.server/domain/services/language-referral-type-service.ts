import type { Result, Option } from 'oxide.ts';

import type { LanguageReferralType, LocalizedLanguageReferralType } from '~/.server/domain/models';
import { getDefaultLanguageReferralType } from '~/.server/domain/services/language-referral-type-service-default';
import { getMockLanguageReferralType } from '~/.server/domain/services/language-referral-type-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type LanguageReferralTypeService = {
  listAll(): Promise<readonly LanguageReferralType[]>;
  getById(id: string): Promise<Result<LanguageReferralType, AppError>>;
  findById(id: string): Promise<Option<LanguageReferralType>>;
  getByCode(code: string): Promise<Result<LanguageReferralType, AppError>>;
  findByCode(code: string): Promise<Option<LanguageReferralType>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedLanguageReferralType[]>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedLanguageReferralType>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedLanguageReferralType, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedLanguageReferralType>>;
};

export function getLanguageReferralTypeService(): LanguageReferralTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockLanguageReferralType() : getDefaultLanguageReferralType();
}
