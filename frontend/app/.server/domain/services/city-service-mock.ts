import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import { createCustomMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import esdcCitiesData from '~/.server/resources/cities.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: City[] = esdcCitiesData.content.map((city) => ({
  id: city.id,
  code: city.code,
  nameEn: city.nameEn,
  nameFr: city.nameFr,
  province: {
    id: city.province.id,
    code: city.province.code,
    nameEn: city.province.nameEn,
    nameFr: city.province.nameFr,
  },
}));

// Centralized localization logic
function localizeCity(city: City, language: Language): LocalizedCity {
  return {
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    province: {
      id: city.province.id,
      code: city.province.code,
      name: language === 'fr' ? city.province.nameFr : city.province.nameEn,
    },
  };
}

// Create a single instance of the service using shared implementation with custom localization
const sharedService = createCustomMockLookupService<City, LocalizedCity>(
  mockData,
  'city',
  ErrorCodes.NO_CITY_FOUND,
  localizeCity,
);

export function getMockCityService(): CityService {
  return {
    listAll(): Promise<readonly City[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    getByCode(code: string) {
      return Promise.resolve(sharedService.getByCode(code));
    },

    listAllLocalized(language: Language) {
      return Promise.resolve(sharedService.listAllLocalized(language));
    },

    getLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.getLocalizedById(id, language));
    },

    findLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.findLocalizedById(id, language));
    },

    getLocalizedByCode(code: string, language: Language) {
      return Promise.resolve(sharedService.getLocalizedByCode(code, language));
    },

    findLocalizedByCode(code: string, language: Language) {
      return Promise.resolve(sharedService.findLocalizedByCode(code, language));
    },
  };
}
