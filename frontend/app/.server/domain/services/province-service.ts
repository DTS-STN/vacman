import type { Result, Option } from 'oxide.ts';

import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { getDefaultProvinceService } from '~/.server/domain/services/province-service-default';
import { getMockProvinceService } from '~/.server/domain/services/province-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProvinceService = {
  getAll(): Promise<Result<readonly Province[], AppError>>;
  getById(id: string): Promise<Result<Province, AppError>>;
  findById(id: string): Promise<Option<Province>>;
  getByCode(code: string): Promise<Result<Province, AppError>>;
  findByCode(code: string): Promise<Option<Province>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedProvince[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedProvince, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedProvince>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedProvince, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedProvince>>;
};

export function getProvinceService(): ProvinceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProvinceService() : getDefaultProvinceService();
}
