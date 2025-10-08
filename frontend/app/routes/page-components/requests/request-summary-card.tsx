import type { ComponentProps, JSX } from 'react';

import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { RequestStatus } from '~/.server/domain/models';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { InlineLink } from '~/components/links';
import { REQUEST_STATUS_CODE } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';

export interface RequestSummaryCardProps extends ComponentProps<'div'> {
  file?: I18nRouteFile;
  lang: 'en' | 'fr';
  params?: Params;
  priorityClearanceNumber?: string;
  pscClearanceNumber?: string;
  requestStatus: RequestStatus;
  view: 'hr-advisor' | 'hiring-manager';
}

export function RequestSummaryCard({
  file,
  lang,
  params,
  priorityClearanceNumber,
  pscClearanceNumber,
  requestStatus,
  view,
}: RequestSummaryCardProps): JSX.Element {
  const { t } = useTranslation('app');

  const showClearanceCard =
    requestStatus.code === REQUEST_STATUS_CODE.PSC_GRANTED || requestStatus.code === REQUEST_STATUS_CODE.CLR_GRANTED;

  const showMatchesCard = requestStatus.code === REQUEST_STATUS_CODE.FDBK_PENDING && view === 'hiring-manager';

  return (
    <>
      {showClearanceCard && (
        <div>
          <Card className="mt-6 rounded bg-gray-100">
            <CardHeader>
              <CardTitle>{lang === 'en' ? requestStatus.nameEn : requestStatus.nameFr}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span>
                {labelWithColon(t('hr-advisor-referral-requests.vms-clearance-number'), lang)} {priorityClearanceNumber}
              </span>
              {requestStatus.code === REQUEST_STATUS_CODE.PSC_GRANTED && (
                <span>
                  {labelWithColon(t('hr-advisor-referral-requests.psc-clearance-number'), lang)} {pscClearanceNumber}
                </span>
              )}
              {/* TODO: display View candidates link when the matches are available and the request status id is PSC_GRANTED */}
            </CardContent>
          </Card>
        </div>
      )}
      {showMatchesCard && (
        <Card className="mt-6 rounded bg-gray-100">
          <CardHeader>
            <CardTitle>{t('hiring-manager-referral-requests.matches-available')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span>{t('hiring-manager-referral-requests.matches-available-detail')}</span>
            {file && (
              <InlineLink className="text-sky-800 decoration-slate-400" file={file} params={params}>
                {t('hiring-manager-referral-requests.matches-available-link')}
              </InlineLink>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function labelWithColon(label: string, lang: 'en' | 'fr') {
  return lang === 'fr' ? `${label}\u00A0:` : `${label}:`;
}
