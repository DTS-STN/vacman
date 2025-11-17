import { useTranslation } from 'react-i18next';

import type { User } from '~/.server/domain/models';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';

interface BaseProps {
  submitter: User | undefined;
  hiringManager: User | undefined;
  subDelegatedManager: User | undefined;
  additionalContact: User | undefined;
  branchOrServiceCanadaRegion: string | undefined;
  directorate: string | undefined;
  languageOfCorrespondence: string | undefined;
  additionalComment: string | undefined;
  alternateContactEmailAddress: string | undefined;
}

interface HrAdvisorProps extends BaseProps {
  view: 'hr-advisor';
  isSubmissionNew?: never;
}

interface HiringManagerProps extends BaseProps {
  view: 'hiring-manager';
  isSubmissionNew: boolean | undefined;
}

type SubmissionDetailSectionProps = HrAdvisorProps | HiringManagerProps;

export default function SubmissionDetailSection({
  isSubmissionNew,
  submitter,
  hiringManager,
  subDelegatedManager,
  additionalContact,
  branchOrServiceCanadaRegion,
  directorate,
  languageOfCorrespondence,
  additionalComment,
  alternateContactEmailAddress,
}: SubmissionDetailSectionProps) {
  const { t } = useTranslation(['gcweb', 'app']);

  return (
    <>
      {isSubmissionNew ? (
        <>{t('app:referral-requests.submission-intro')}</>
      ) : (
        <DescriptionList>
          <DescriptionListItem term={t('app:submission-details.submiter-title')}>
            {submitter ? (
              <>
                {submitter.firstName} {submitter.lastName}
                <br />
                {submitter.businessEmailAddress}
              </>
            ) : (
              t('app:referral-requests.not-provided')
            )}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.hiring-manager-title')}>
            {hiringManager ? (
              <>
                {hiringManager.firstName} {hiringManager.lastName}
                <br />
                {hiringManager.businessEmailAddress}
              </>
            ) : (
              t('app:referral-requests.not-provided')
            )}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.sub-delegate-title')}>
            {subDelegatedManager ? (
              <>
                {subDelegatedManager.firstName} {subDelegatedManager.lastName}
                <br />
                {subDelegatedManager.businessEmailAddress}
              </>
            ) : (
              t('app:referral-requests.not-provided')
            )}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.alternate-contact-title')}>
            {additionalContact ? (
              <>
                {additionalContact.firstName} {additionalContact.lastName}
                <br />
                {additionalContact.businessEmailAddress ??
                  alternateContactEmailAddress ??
                  t('app:referral-requests.not-provided')}
              </>
            ) : (
              (alternateContactEmailAddress ?? t('app:referral-requests.not-provided'))
            )}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.branch-or-service-canada-region')}>
            {branchOrServiceCanadaRegion ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.directorate')}>
            {directorate ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
            {languageOfCorrespondence ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:submission-details.additional-comments')}>
            {additionalComment ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>
        </DescriptionList>
      )}
    </>
  );
}
