import type { ComponentProps, JSX } from 'react';

import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { RequestStatus } from '~/.server/domain/models';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { InlineLink } from '~/components/links';
import { REQUEST_STATUS_CODE } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';

interface RenderCardProps {
  title: string;
  details: string[];
  linkText?: string;
  file?: I18nRouteFile;
  params?: Params;
}

function RenderCard({ title, details, linkText, file, params }: RenderCardProps): JSX.Element {
  return (
    <Card className="mt-6 rounded bg-gray-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {details.map((detail) => (
          <span key={detail}>{detail}</span>
        ))}
        {linkText && file && (
          <InlineLink className="text-sky-800 decoration-slate-400" file={file} params={params}>
            {linkText}
          </InlineLink>
        )}
      </CardContent>
    </Card>
  );
}

export interface RequestSummaryCardProps extends ComponentProps<'div'> {
  file?: I18nRouteFile;
  hasMatches?: boolean;
  lang: 'en' | 'fr';
  params?: Params;
  priorityClearanceNumber?: string;
  pscClearanceNumber?: string;
  requestStatus: RequestStatus;
  view: 'hr-advisor' | 'hiring-manager';
}

export function RequestSummaryCard({
  file,
  hasMatches,
  lang,
  params,
  priorityClearanceNumber,
  pscClearanceNumber,
  requestStatus,
  view,
}: RequestSummaryCardProps): JSX.Element | null {
  const { t } = useTranslation('app');
  const code = requestStatus.code;

  // Named booleans for clarity
  const showClearanceCard = code === REQUEST_STATUS_CODE.CLR_GRANTED;

  const showPSCClearanceCard = code === REQUEST_STATUS_CODE.PSC_GRANTED;

  const showMatchesCard = code === REQUEST_STATUS_CODE.FDBK_PENDING && view === 'hiring-manager';

  const showCandidateFeedbackSubmittedCard = code === REQUEST_STATUS_CODE.FDBK_PEND_APPR && view === 'hiring-manager';

  const showFeedbackAvailableCard = code === REQUEST_STATUS_CODE.FDBK_PEND_APPR && view === 'hr-advisor';

  let cardProps: RenderCardProps | null = null;

  if (showClearanceCard) {
    const details = getClearanceDetails(t, lang, priorityClearanceNumber);
    cardProps = {
      title: t('hiring-manager-referral-requests.clearance-granted'),
      details,
      ...(hasMatches && { linkText: t('hiring-manager-referral-requests.view-candidates-link'), file, params }),
    };
  } else if (showPSCClearanceCard) {
    const details = getClearanceDetails(t, lang, priorityClearanceNumber, pscClearanceNumber);
    cardProps = {
      title: t('hiring-manager-referral-requests.psc-clearance-granted'),
      details,
      ...(hasMatches && { linkText: t('hiring-manager-referral-requests.view-candidates-link'), file, params }),
    };
  } else if (showMatchesCard) {
    cardProps = {
      title: t('hiring-manager-referral-requests.matches-available'),
      details: [t('hiring-manager-referral-requests.matches-available-detail')],
      linkText: t('hiring-manager-referral-requests.view-candidates-link'),
      file,
      params,
    };
  } else if (showCandidateFeedbackSubmittedCard) {
    cardProps = {
      title: t('hiring-manager-referral-requests.candidate-feedback-submitted'),
      details: [t('hiring-manager-referral-requests.candidate-feedback-submitted-detail')],
      linkText: t('hiring-manager-referral-requests.view-candidates-link'),
      file,
      params,
    };
  } else if (showFeedbackAvailableCard) {
    cardProps = {
      title: t('hr-advisor-referral-requests.feedback-available'),
      details: [t('hr-advisor-referral-requests.feedback-available-detail')],
      linkText: t('hr-advisor-referral-requests.view-feedback-link'),
      file,
      params,
    };
  }

  return cardProps ? <RenderCard {...cardProps} /> : null;
}

function labelWithColon(label: string, lang: 'en' | 'fr') {
  return lang === 'fr' ? `${label}\u00A0:` : `${label}:`;
}

function getClearanceDetails(
  t: ReturnType<typeof useTranslation>['t'],
  lang: 'en' | 'fr',
  priorityClearanceNumber?: string,
  pscClearanceNumber?: string,
): string[] {
  const details = [
    `${labelWithColon(t('hr-advisor-referral-requests.vms-clearance-number'), lang)} ${priorityClearanceNumber}`,
  ];
  if (pscClearanceNumber) {
    details.push(`${labelWithColon(t('hr-advisor-referral-requests.psc-clearance-number'), lang)} ${pscClearanceNumber}`);
  }
  return details;
}
