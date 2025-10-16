import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';

interface EmploymentInformationSectionProps {
  branchOrServiceCanadaRegion?: string;
  city?: string;
  directorate?: string;
  hrAdvisor?: string;
  province?: string;
  substantivePosition?: string;
  wfaStatus?: string;
  wfaStatusCode?: string;
  wfaEffectiveDate?: string;
  wfaEndDate?: string;
}

export function EmploymentInformationSection({
  branchOrServiceCanadaRegion,
  city,
  directorate,
  hrAdvisor,
  province,
  substantivePosition,
  wfaStatus,
  wfaStatusCode,
  wfaEffectiveDate,
  wfaEndDate,
}: EmploymentInformationSectionProps): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <>
      <div>
        <h3 className="font-lato text-xl font-bold">{t('employment-information.substantive-position-heading')}</h3>
        <DescriptionList>
          <DescriptionListItem term={t('employment-information.substantive-position-group-and-level')}>
            {substantivePosition ?? t('profile.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('employment-information.branch-or-service-canada-region')}>
            {branchOrServiceCanadaRegion ?? t('profile.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('employment-information.directorate')}>
            {directorate ?? t('profile.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('employment-information.provinces')}>
            {province ?? t('profile.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('employment-information.city')}>{city ?? t('profile.not-provided')}</DescriptionListItem>
        </DescriptionList>
      </div>
      <div>
        <h3 className="font-lato text-xl font-bold">{t('employment-information.wfa-details-heading')}</h3>
        <DescriptionList>
          <DescriptionListItem term={t('employment-information.wfa-status')}>
            {wfaStatus ?? t('profile.not-provided')}
          </DescriptionListItem>
          <DescriptionListItem term={t('employment-information.wfa-effective-date')}>
            {wfaEffectiveDate ?? t('profile.not-provided')}
          </DescriptionListItem>
          {(wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
            wfaStatusCode === EMPLOYEE_WFA_STATUS.exOpting ||
            wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA ||
            wfaStatusCode === EMPLOYEE_WFA_STATUS.exSurplusCPA ||
            wfaStatusCode === EMPLOYEE_WFA_STATUS.relocation ||
            wfaStatusCode === EMPLOYEE_WFA_STATUS.alternateDeliveryInitiative) && (
            <DescriptionListItem term={t('employment-information.wfa-end-date')}>
              {wfaEndDate ?? t('profile.not-provided')}
            </DescriptionListItem>
          )}
          <DescriptionListItem term={t('employment-information.hr-advisor')}>
            {hrAdvisor ?? t('profile.not-provided')}
          </DescriptionListItem>
        </DescriptionList>
      </div>
    </>
  );
}
