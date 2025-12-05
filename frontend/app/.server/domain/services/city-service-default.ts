import type { City, LocalizedCity } from '~/.server/domain/models';
import type { CityService } from '~/.server/domain/services/city-service';
import { createCustomLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Centralized localization logic
function localizeCity(city: City, language: Language): LocalizedCity {
  return {
    id: city.id,
    code: city.code,
    name: language === 'fr' ? city.nameFr : city.nameEn,
    expiryDate: city.expiryDate,
    provinceTerritory: {
      id: city.provinceTerritory.id,
      code: city.provinceTerritory.code,
      name: language === 'fr' ? city.provinceTerritory.nameFr : city.provinceTerritory.nameEn,
      expiryDate: city.provinceTerritory.expiryDate,
    },
  };
}

// Create a single instance of the service using shared implementation with custom localization
const sharedService = createCustomLookupService<City, LocalizedCity>(
  '/codes/cities',
  'city',
  ErrorCodes.NO_CITY_FOUND,
  localizeCity,
);

// Create a shared instance of the service (module-level singleton)
export const cityService: CityService = sharedService;

/**
 * Returns the default city service instance.
 */
export function getDefaultCityService(): CityService {
  return cityService;
}
