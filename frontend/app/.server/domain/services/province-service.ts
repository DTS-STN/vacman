import type { LocalizedProvince, Province } from '~/.server/domain/models';
import { getDefaultProvince } from '~/.server/domain/services/province-service-default';
import { getMockProvince } from '~/.server/domain/services/province-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type ProvinceService = {
  getProvinces(): Promise<readonly Province[]>;
  getProvinceById(id: string): Promise<Province | undefined>;
  getProvinceByAlphaCode(alphaCode: string): Promise<Province | undefined>;
  getLocalizedProvinces(language: Language): Promise<readonly LocalizedProvince[]>;
};

export function getProvinceService(): ProvinceService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProvince() : getDefaultProvince();
}
