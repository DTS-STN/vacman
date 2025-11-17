import type { JSX } from 'react';

import type { LocationScope } from '~/utils/location-utils';

interface LocationScopeDisplayProps {
  locationScope: LocationScope;
  preferredCities: {
    province: string;
    city: string;
  }[];
  provinceNames: string[];
  notProvidedText: string;
  anywhereInCountryText: string;
  allWorkLocationsText: string;
}

type CityPreference = {
  province: string;
  city: string;
};

type GroupedCities = Record<string, string[]>;

/**
 * Component to display location scope information in a consistent format.
 * Handles different location scopes: not-provided, anywhere-in-country, anywhere-in-provinces, and specific-cities.
 */
export function LocationScopeDisplay({
  locationScope,
  preferredCities,
  provinceNames,
  notProvidedText,
  anywhereInCountryText,
  allWorkLocationsText,
}: LocationScopeDisplayProps): JSX.Element {
  return (
    <>
      {locationScope === 'not-provided' && <p>{notProvidedText}</p>}

      {locationScope === 'anywhere-in-country' && <p>{anywhereInCountryText}</p>}

      {locationScope === 'anywhere-in-provinces' && (
        <div>
          {provinceNames.map((provinceName) => (
            <div key={provinceName}>
              <strong>{provinceName}:</strong> {allWorkLocationsText}
            </div>
          ))}
        </div>
      )}

      {locationScope === 'specific-cities' && preferredCities.length > 0 && (
        <>
          {provinceNames.length > 0 && (
            <div>
              {provinceNames.map((provinceName) => (
                <div key={provinceName}>
                  <strong>{provinceName}:</strong> {allWorkLocationsText}
                </div>
              ))}
            </div>
          )}
          <div>
            {/* Group cities by province */}
            {Object.entries(
              (preferredCities as CityPreference[]).reduce((acc: GroupedCities, city: CityPreference) => {
                const provinceName = city.province;
                acc[provinceName] ??= [];
                acc[provinceName].push(city.city);
                return acc;
              }, {} as GroupedCities),
            ).map(([province, cities]) => (
              <div key={province}>
                <strong>{province}:</strong> {cities.join(', ')}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
