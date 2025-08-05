import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { getDefaultProvinceService } from '~/.server/domain/services/province-service-default';
import { getMockProvinceService } from '~/.server/domain/services/province-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type ProvinceService = {
  listAll(): Promise<readonly Province[]>;
  listAllLocalized(language: Language): Promise<readonly LocalizedProvince[]>;
};

export function getProvinceService(): ProvinceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProvinceService() : getDefaultProvinceService();
}
