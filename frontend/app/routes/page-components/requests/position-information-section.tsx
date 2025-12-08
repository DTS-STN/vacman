import { useTranslation } from 'react-i18next';

import type { Classification } from '~/.server/domain/models';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LocationScopeDisplay } from '~/components/location-scope-display';

interface ProcessInformationSectionProps {
  positionNumber?: string;
  classification?: Classification;
  englishTitle?: string;
  frenchTitle?: string;
  locationScope: 'anywhere-in-provinces' | 'not-provided' | 'anywhere-in-country' | 'specific-cities';
  preferredCities: {
    province: string;
    city: string;
  }[];
  provinceNames: string[];
  isPositionNew?: boolean;
  languageRequirements?: string;
  securityClearanceName?: string;
}

export default function PositionInformationSection({
  isPositionNew,
  positionNumber,
  classification,
  englishTitle,
  frenchTitle,
  locationScope,
  preferredCities,
  provinceNames,
  languageRequirements,
  securityClearanceName,
}: ProcessInformationSectionProps) {
  const { t } = useTranslation(['gcweb', 'app']);

  return (
    <>
      {isPositionNew ? (
        <>{t('app:referral-requests.position-intro')}</>
      ) : (
        <DescriptionList>
          <DescriptionListItem term={t('app:position-information.position-number')}>
            {positionNumber ? positionNumber.split(',').join(', ') : t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:position-information.group-and-level')}>
            {classification?.code ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:position-information.title-en')}>
            {englishTitle ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:position-information.title-fr')}>
            {frenchTitle ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:position-information.locations')}>
            <LocationScopeDisplay
              locationScope={locationScope}
              preferredCities={preferredCities}
              provinceNames={provinceNames}
              notProvidedText={t('app:profile.not-provided')}
              anywhereInCountryText={t('app:anywhere-in-canada')}
              allWorkLocationsText={t('app:all-work-locations')}
            />
          </DescriptionListItem>

          <DescriptionListItem term={t('app:position-information.language-requirement')}>
            {languageRequirements ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('app:position-information.security-requirement')}>
            {securityClearanceName ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>
        </DescriptionList>
      )}
    </>
  );
}
