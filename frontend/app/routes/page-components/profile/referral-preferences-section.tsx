import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LocationScopeDisplay } from '~/components/location-scope-display';

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
          <LocationScopeDisplay
            locationScope={locationScope}
            preferredCities={preferredCities}
            provinceNames={provinceNames}
            notProvidedText={tApp('profile.not-provided')}
            anywhereInCountryText={tApp('anywhere-in-canada')}
            allWorkLocationsText={tApp('all-work-locations')}
          />
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
