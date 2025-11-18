import { useTranslation } from 'react-i18next';

import { trimToUndefined } from '~/utils/string-utils';

interface SomcConditionsSectionProps {
  englishStatementOfMerit?: string;
  frenchStatementOfMerit?: string;
  isStatementOfMeritCriteriaNew?: boolean;
}

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
