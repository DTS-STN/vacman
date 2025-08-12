import { useTranslation } from 'react-i18next';

import type { AcronymEnum } from '~/domain/constants';

interface AbbreviationProps {
  acronymEnum: AcronymEnum;
}
export function HtmlAbbreviation({ acronymEnum }: AbbreviationProps) {
  const { t } = useTranslation('gcweb');
  return <abbr title={t(`acronym.${acronymEnum}.text`)}>{t(`acronym.${acronymEnum}.abbreviation`)}</abbr>;
}
