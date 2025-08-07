import type { Result, Option } from 'oxide.ts';

import type { City, LocalizedCity } from '~/.server/domain/models';
import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { getMockCityService } from '~/.server/domain/services/city-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type CityService = {
  listAll(): Promise<readonly City[]>;
  getById(id: number): Promise<Result<City, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedCity[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedCity, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedCity>>;
};

export function getCityService(): CityService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockCityService() : getDefaultCityService();
}
