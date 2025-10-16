import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { DescriptionList, DescriptionListItem } from '~/components/description-list';

interface ReferralPreferencesSectionProps {
  isAvailableForReferral?: boolean;
  isInterestedInAlternation?: boolean;
  locationScope: 'anywhere-in-provinces' | 'not-provided' | 'anywhere-in-country' | 'specific-cities';
  preferredCities: {
    province: string;
    city: string;
  }[];
  preferredClassifications?: string[];
  preferredLanguages?: string[];
  provinceNames: string[];
}

export function ReferralPreferencesSection({
  isAvailableForReferral,
  isInterestedInAlternation,
  locationScope,
  preferredCities,
  preferredClassifications,
  preferredLanguages,
  provinceNames,
}: ReferralPreferencesSectionProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  type CityPreference = {
    province: string;
    city: string;
  };

  type GroupedCities = Record<string, string[]>;

  return (
    <>
      <DescriptionList>
        <DescriptionListItem term={tApp('referral-preferences.language-referral-type')}>
          {preferredLanguages === undefined
            ? tApp('profile.not-provided')
            : preferredLanguages.length > 0 && preferredLanguages.join(', ')}
        </DescriptionListItem>
        <DescriptionListItem term={tApp('referral-preferences.classification')}>
          {preferredClassifications === undefined
            ? tApp('profile.not-provided')
            : preferredClassifications.length > 0 && preferredClassifications.join(', ')}
        </DescriptionListItem>
        <DescriptionListItem term={tApp('referral-preferences.work-location')}>
          {locationScope === 'not-provided' && <p>{tApp('profile.not-provided')}</p>}

          {locationScope === 'anywhere-in-country' && <p>{tApp('anywhere-in-canada')}</p>}

          {locationScope === 'anywhere-in-provinces' && (
            <p>
              {tApp('anywhere-in-provinces', {
                provinceNames: provinceNames.join(', '),
              })}
            </p>
          )}

          {locationScope === 'specific-cities' && preferredCities.length > 0 && (
            <>
              {provinceNames.length > 0 && (
                <p>
                  {tApp('anywhere-in-provinces', {
                    provinceNames: provinceNames.join(', '),
                  })}
                </p>
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
        </DescriptionListItem>
        <DescriptionListItem term={tApp('referral-preferences.referral-availibility')}>
          {isAvailableForReferral === undefined
            ? tApp('profile.not-provided')
            : isAvailableForReferral
              ? tGcweb('input-option.yes')
              : tGcweb('input-option.no')}
        </DescriptionListItem>
        <DescriptionListItem term={tApp('referral-preferences.alternate-opportunity')}>
          {isInterestedInAlternation === undefined
            ? tApp('profile.not-provided')
            : isInterestedInAlternation
              ? tGcweb('input-option.yes')
              : tGcweb('input-option.no')}
        </DescriptionListItem>
      </DescriptionList>
    </>
  );
}
