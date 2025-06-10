import type { Result, Option } from 'oxide.ts';

import type { City } from '~/.server/domain/models';
import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { getMockCityService } from '~/.server/domain/services/city-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type CityService = {
  getAll(): Promise<Result<readonly City[], AppError>>;
  getById(id: string): Promise<Result<City, AppError>>;
  findById(id: string): Promise<Option<City>>;
  getAllByProvinceId(provinceId: string): Promise<Result<readonly City[], AppError>>;
};

export function getCityService(): CityService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockCityService() : getDefaultCityService();
}
