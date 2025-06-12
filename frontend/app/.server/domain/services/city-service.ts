import type { Result, Option } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { getMockCityService } from '~/.server/domain/services/city-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type CityService = {
  getAll(): Promise<Result<readonly City[], AppError>>;
  getById(id: string): Promise<Result<City, AppError>>;
  findById(id: string): Promise<Option<City>>;
  getByCode(code: string): Promise<Result<City, AppError>>;
  findByCode(code: string): Promise<Option<City>>;
  getAllByProvinceId(provinceId: string): Promise<Result<readonly City[], AppError>>;
  getAllByProvinceCode(provinceCode: string): Promise<Result<readonly City[], AppError>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedCity[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedCity, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedCity>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedCity, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedCity>>;
};

export function getCityService(): CityService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockCityService() : getDefaultCityService();
}
