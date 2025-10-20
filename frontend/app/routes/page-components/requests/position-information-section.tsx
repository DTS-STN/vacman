import { useTranslation } from 'react-i18next';

import type { Classification, LanguageRequirement, SecurityClearance } from '~/.server/domain/models';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LANGUAGE_REQUIREMENT_CODES } from '~/domain/constants';

interface BaseProps {
  positionNumber: string | undefined;
  classification: Classification | undefined;
  englishTitle: string | undefined;
  frenchTitle: string | undefined;
  cities: City[] | undefined;
  languageRequirement: LanguageRequirement | undefined;
  englishLanguageProfile: string | undefined;
  frenchLanguageProfile: string | undefined;
}

interface HiringManagerProps extends BaseProps {
  view: 'hiring-manager';
  isPositionNew: boolean | undefined;
  languageRequirementName: string | undefined;
  securityClearanceName: string | undefined;
  securityClearance?: never;
}

interface HrAdvisorProps extends BaseProps {
  view: 'hr-advisor';
  isPositionNew?: never;
  languageRequirementName?: never;
  securityClearanceName?: never;
  securityClearance: SecurityClearance | undefined;
}

type ProcessInformationSectionProps = HiringManagerProps | HrAdvisorProps;

type City = {
  province: string;
  city: string;
};

type GroupedCities = Record<City['province'], City['city'][]>;

export default function PositionInformationSection({
  view,
  isPositionNew,
  positionNumber,
  classification,
  englishTitle,
  frenchTitle,
  cities,
  languageRequirementName,
  languageRequirement,
  englishLanguageProfile,
  frenchLanguageProfile,
  securityClearanceName,
  securityClearance,
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
            {cities === undefined
              ? t('app:referral-requests.not-provided')
              : cities.length > 0 && (
                  <div>
                    {/* Group cities by province */}
                    {Object.entries(
                      (cities as City[]).reduce((acc: GroupedCities, city: City) => {
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
                )}
          </DescriptionListItem>

          {view === 'hiring-manager' ? (
            <>
              <DescriptionListItem term={t('app:position-information.language-profile')}>
                {languageRequirementName ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>
              {(languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
                languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative) && (
                <>
                  <DescriptionListItem term={t('app:position-information.english')}>
                    {englishLanguageProfile ?? t('app:referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.french')}>
                    {frenchLanguageProfile ?? t('app:referral-requests.not-provided')}
                  </DescriptionListItem>
                  <DescriptionListItem term={t('app:position-information.security-requirement')}>
                    {securityClearanceName ?? t('app:referral-requests.not-provided')}
                  </DescriptionListItem>
                </>
              )}
            </>
          ) : (
            <>
              <DescriptionListItem term={t('app:position-information.language-requirement')}>
                {languageRequirement?.code ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:position-information.language-profile')}>
                {`${t('app:position-information.english')}: ${englishLanguageProfile ?? t('app:referral-requests.not-provided')}`}
                <br />
                {`${t('app:position-information.french')}: ${frenchLanguageProfile ?? t('app:referral-requests.not-provided')}`}
              </DescriptionListItem>
              <DescriptionListItem term={t('app:position-information.security-requirement')}>
                {securityClearance?.code ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>
            </>
          )}
        </DescriptionList>
      )}
    </>
  );
}
