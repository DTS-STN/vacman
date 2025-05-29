import type { City } from '~/.server/domain/models';
import { getDefaultCityService } from '~/.server/domain/services/city-service-default';
import { getMockCityService } from '~/.server/domain/services/city-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type CityService = {
  getCities(): Promise<readonly City[]>;
  getCityById(id: string): Promise<City | undefined>;
  getCityByProvinceId(provinceId: string): Promise<readonly City[]>;
};

export function getCityService(): CityService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockCityService() : getDefaultCityService();
}
