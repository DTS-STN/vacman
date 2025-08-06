import type { Result, Option } from 'oxide.ts';

import type { UserType, LocalizedUserType } from '~/.server/domain/models';
import { getDefaultUserTypeService } from '~/.server/domain/services/user-type-service-default';
import { getMockUserTypeService } from '~/.server/domain/services/user-type-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type UserTypeService = {
  listAll(): Promise<readonly UserType[]>;
  getById(id: number): Promise<Result<UserType, AppError>>;
  findById(id: number): Promise<Option<UserType>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedUserType[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedUserType, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedUserType>>;
};

export function getUserTypeService(): UserTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockUserTypeService() : getDefaultUserTypeService();
}
