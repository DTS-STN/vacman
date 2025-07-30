import type { LocalizedProvince, Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import esdcProvincesData from '~/.server/resources/provinces.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: Province[] = esdcProvincesData.content.map((province) => ({
  id: province.id.toString(),
  code: province.alphaCode,
  nameEn: province.nameEn,
  nameFr: province.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<Province>(transformedData, 'province', ErrorCodes.NO_PROVINCE_FOUND);

export function getMockProvinceService(): ProvinceService {
  return {
    listAll(): Promise<readonly Province[]> {
      return Promise.resolve(sharedService.listAll());
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedProvince[]> {
      return Promise.resolve(sharedService.listAllLocalized(language));
    },
  };
}
