import { useTranslation } from 'react-i18next';

import type { User } from '~/.server/domain/models';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { getUserFullName } from '~/utils/string-utils';

interface SubmissionDetailSectionProps {
  submitter?: User;
  hiringManager?: User;
  subDelegatedManager?: User;
  additionalContact?: User;
  branchOrServiceCanadaRegion?: string;
  directorate?: string;
  languageOfCorrespondence?: string;
  additionalComment?: string;
  alternateContactEmailAddress?: string;
  isSubmissionNew?: boolean;
}

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
                {getUserFullName(additionalContact)}
                <br />
                {additionalContact.businessEmailAddress ?? t('app:referral-requests.not-provided')}
              </>
            ) : (
              t('app:referral-requests.not-provided')
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
