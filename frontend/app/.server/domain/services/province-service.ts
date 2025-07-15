import type { Result, Option } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { getDefaultProvinceService } from '~/.server/domain/services/province-service-default';
import { getMockProvinceService } from '~/.server/domain/services/province-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProvinceService = {
  listAll(): Promise<readonly Province[]>;
  getById(id: string): Promise<Result<Province, AppError>>;
  getByCode(code: string): Promise<Result<Province, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedProvince[]>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedProvince, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedProvince>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedProvince, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedProvince>>;
};

export function getProvinceService(): ProvinceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProvinceService() : getDefaultProvinceService();
}
