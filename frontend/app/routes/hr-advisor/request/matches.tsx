import { useRef } from 'react';

import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/matches';

import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getMatchStatusService } from '~/.server/domain/services/match-status-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { Progress } from '~/components/progress';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import MatchesTable from '~/routes/page-components/requests/tables/matches-tables';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  //TODO add action logic
  return undefined;
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  /*
  TODO - implement fetching request matches

  const requestMatchesResult = await getRequestService().getRequestMatches(
    parseInt(params.requestId),
    session.authState.accessToken,
  );

  const requestMatches = requestMatchesResult.into()?.content ?? [];
  */
  const requestStatuses = await getRequestStatusService().listAll();
  const matchStatus = await getMatchStatusService().listAllLocalized(lang);
  const matchFeedback = await getMatchFeedbackService().listAllLocalized(lang);

  const requestMatches = [
    {
      id: 3,
      employee: {
        firstName: 'Alice',
        initial: 'M',
        lastName: 'Smith',
      },
      wfaStatus: 'A-A',
      feedback: 'QA-QOA',
      comment: {
        hrAdvisor: undefined,
        hiringManager: 'Interested in remote work.',
      },
      approval: false,
    },
    {
      id: 4,
      employee: {
        firstName: 'Bob',
        initial: 'R',
        lastName: 'Johnson',
      },
      wfaStatus: 'A-A',
      feedback: 'QNS',
      comment: {
        hrAdvisor: 'Interested in remote work.',
        hiringManager: undefined,
      },
      approval: false,
    },
    {
      id: 5,
      employee: {
        firstName: 'Alex',
        initial: 'T',
        lastName: 'Tan',
      },
      wfaStatus: 'PA-EAA',
      feedback: 'NQO-NQA',
      comment: {
        hrAdvisor: 'Interested in remote work.',
        hiringManager: undefined,
      },
      approval: true,
    },
  ];

  return {
    documentTitle: t('app:matches.page-title'),
    lang,
    matchStatus,
    matchFeedback,
    requestMatches,
    requestStatus: requestStatuses[5],
    branch: 'Chief Financial Officer Branch',
    requestDate: '0000-00-00',
    hiringManager: {
      firstName: 'Tim',
      lastName: 'Tom',
      email: 'hiring.manager@email.ca',
    },
    hrAdvisor: {
      firstName: 'Tim',
      lastName: 'Tam',
      email: 'hr.advisor@email.ca',
    },
    feedbackProgress: 90,
  };
}

export default function HrAdvisorMatches({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const alertRef = useRef<HTMLDivElement>(null);
  const requestId = params.requestId;

  return (
    <div className="mb-8 space-y-4">
      <VacmanBackground variant="top-right">
        {loaderData.requestStatus && (
          <RequestStatusTag rounded status={loaderData.requestStatus} lang={loaderData.lang} view="hr-advisor" />
        )}
        <PageTitle className="after:w-14" subTitle={loaderData.branch}>
          {t('app:matches.referral-request')}
        </PageTitle>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p>{t('app:matches.request-id')}</p>
            <p className="text-[#9FA3AD]">{requestId}</p>
          </div>
          <div>
            <p>{t('app:matches.request-date')}</p>
            <p className="text-[#9FA3AD]">{loaderData.requestDate}</p>
          </div>
          <div>
            <p>{t('app:matches.hiring-manager')}</p>
            <p className="text-[#9FA3AD]">
              {loaderData.hiringManager.firstName} {loaderData.hiringManager.lastName}
            </p>
            <p>{loaderData.hiringManager.email}</p>
          </div>
          <div>
            <p>{t('app:matches.hr-advisor')}</p>
            <p className="text-[#9FA3AD]">
              {loaderData.hrAdvisor.firstName} {loaderData.hrAdvisor.lastName}
            </p>
            <p>{loaderData.hrAdvisor.email}</p>
          </div>
        </div>
      </VacmanBackground>
      <BackLink
        className="my-4"
        aria-label={t('app:matches.back-request-details')}
        file="routes/hr-advisor/index.tsx"
        params={params}
      >
        {t('app:matches.back-request-details')}
      </BackLink>
      <h2 className="font-lato mt-4 text-2xl font-bold">{t('app:matches.request-candidates')}</h2>
      <p className="sm:w-2/3 md:w-3/4">{t('app:matches.page-info')}</p>
      <AlertMessage ref={alertRef} type="info" role="alert" ariaLive="assertive">
        <Trans
          i18nKey="app:matches.feedback.approved"
          components={{
            InlineLink: (
              <InlineLink
                className="text-sky-800 decoration-slate-400"
                file={`routes/hr-advisor/request/index.tsx`}
                params={params}
              />
            ),
            strong: <strong className="font-semibold" />,
          }}
        />
      </AlertMessage>
      <Progress className="mt-8 mb-8" variant="blue" label="" value={loaderData.feedbackProgress} />
      <MatchesTable {...loaderData} requestId={params.requestId} view="hr-advisor" />
    </div>
  );
}
