import type { LocalizedCity } from '~/.server/domain/models';

export type LocationScope = 'anywhere-in-country' | 'anywhere-in-provinces' | 'specific-cities' | 'not-provided';

export interface LocationScopeResult {
  locationScope: LocationScope;
  provinceNames: string[];
  partiallySelectedCities: { province: string; city: string }[];
}

/**
 * Calculates the location scope based on preferred cities selection.
 *
 * @param preferredCityIds - Set of IDs of preferred cities
 * @param allLocalizedCities - Array of all available localized cities
 * @returns Object containing location scope, province names, and partially selected cities
 */
export function calculateLocationScope(
  preferredCityIds: Set<number>,
  allLocalizedCities: readonly LocalizedCity[],
): LocationScopeResult {
  const allProvinceIds = Array.from(new Set(allLocalizedCities.map((city) => city.provinceTerritory.id)));

  const provinceToCitiesMap = new Map<number, LocalizedCity[]>();

  // Group all cities by province
  for (const city of allLocalizedCities) {
    const provinceId = city.provinceTerritory.id;
    if (!provinceToCitiesMap.has(provinceId)) {
      provinceToCitiesMap.set(provinceId, []);
    }
    provinceToCitiesMap.get(provinceId)?.push(city);
  }

  // Determine which provinces are fully selected
  const fullySelectedProvinces: string[] = [];
  const partiallySelectedCities: { province: string; city: string }[] = [];

  for (const [, cities] of provinceToCitiesMap.entries()) {
    const selectedCities = cities.filter((city) => preferredCityIds.has(city.id));
    if (selectedCities.length === cities.length) {
      // All cities in this province are selected
      const provinceName = cities[0]?.provinceTerritory.name;
      if (provinceName) {
        fullySelectedProvinces.push(provinceName);
      }
    } else if (selectedCities.length > 0) {
      // Some cities in this province are selected
      for (const city of selectedCities) {
        partiallySelectedCities.push({
          province: city.provinceTerritory.name,
          city: city.name,
        });
      }
    }
  }

  let locationScope: LocationScope;
  let provinceNames: string[] = [];

  if (preferredCityIds.size === 0) {
    locationScope = 'not-provided';
  } else if (fullySelectedProvinces.length === allProvinceIds.length) {
    locationScope = 'anywhere-in-country';
  } else if (fullySelectedProvinces.length > 0 && partiallySelectedCities.length === 0) {
    locationScope = 'anywhere-in-provinces';
    provinceNames = fullySelectedProvinces;
  } else {
    locationScope = 'specific-cities';
    provinceNames = fullySelectedProvinces;
  }

  return {
    locationScope,
    provinceNames,
    partiallySelectedCities,
  };
}
