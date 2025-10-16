import type { JSX } from 'react';

import { useTranslation } from 'react-i18next';

import { DescriptionList, DescriptionListItem } from '~/components/description-list';

interface PersonalInformationSectionProps {
  personalEmail?: string;
  personalPhone?: string;
  preferredLanguage?: string;
  personalRecordIdentifier?: string;
  workEmail?: string;
  workPhone?: string;
}

export function PersonalInformationSection({
  personalEmail,
  personalPhone,
  preferredLanguage,
  personalRecordIdentifier,
  workEmail,
  workPhone,
}: PersonalInformationSectionProps): JSX.Element {
  const { t } = useTranslation('app');
  return (
    <>
      <DescriptionList>
        <DescriptionListItem term={t('personal-information.personal-record-identifier')}>
          {personalRecordIdentifier ?? t('profile.not-provided')}
        </DescriptionListItem>
        <DescriptionListItem term={t('personal-information.language-of-correspondence')}>
          {preferredLanguage ?? t('profile.not-provided')}
        </DescriptionListItem>
        <DescriptionListItem term={t('personal-information.work-email')}>{workEmail}</DescriptionListItem>
        <DescriptionListItem term={t('personal-information.personal-email')}>
          {personalEmail ?? t('profile.not-provided')}
        </DescriptionListItem>
        <DescriptionListItem term={t('personal-information.work-phone')}>
          {workPhone ?? t('profile.not-provided')}
        </DescriptionListItem>
        <DescriptionListItem term={t('personal-information.personal-phone')}>
          {personalPhone ?? t('profile.not-provided')}
        </DescriptionListItem>
      </DescriptionList>
    </>
  );
}
