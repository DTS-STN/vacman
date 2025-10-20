import { useTranslation } from 'react-i18next';

import { trimToUndefined } from '~/utils/string-utils';

interface BaseProps {
  englishStatementOfMerit: string | undefined;
  frenchStatementOfMerit: string | undefined;
}

interface HrAdvisorProps extends BaseProps {
  view: 'hr-advisor';
  isStatementOfMeritCriteriaNew?: never;
}

interface HiringManagerProps extends BaseProps {
  view: 'hiring-manager';
  isStatementOfMeritCriteriaNew: boolean | undefined;
}

type SomcConditionsSectionProps = HrAdvisorProps | HiringManagerProps;

export default function SomcConditionsSection({
  isStatementOfMeritCriteriaNew,
  englishStatementOfMerit,
  frenchStatementOfMerit,
}: SomcConditionsSectionProps) {
  const { t } = useTranslation(['gcweb', 'app']);

  return (
    <>
      {isStatementOfMeritCriteriaNew ? (
        <>{t('app:referral-requests.somc-intro')}</>
      ) : (
        <p className="font-medium">
          {trimToUndefined(englishStatementOfMerit) && trimToUndefined(frenchStatementOfMerit)
            ? t('app:somc-conditions.english-french-provided')
            : t('app:referral-requests.not-provided')}
        </p>
      )}
    </>
  );
}
