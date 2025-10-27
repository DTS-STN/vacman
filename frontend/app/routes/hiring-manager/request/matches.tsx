import { useEffect, useRef, useState } from 'react';

import { useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/matches';

import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import { InputCheckbox } from '~/components/input-checkbox';
import { PageTitle } from '~/components/page-title';
import { Progress } from '~/components/progress';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import MatchesTables from '~/routes/page-components/requests/matches-tables';
import { formatDateTimeForTimezone } from '~/utils/date-utils';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const formData = await request.formData();

  //TODO - Implement form submit
  switch (formData.get('action')) {
    case 'save': {
      return i18nRedirect('routes/hiring-manager/request/index.tsx', request, {
        params,
      });
    }
    case 'submit': {
      const confirmRetraining = formData.get('confirmRetraining') ? true : false;
      return {
        confirmRetraining,
      };
    }
    case 'feedback': {
      formString(formData.get('id'));
      formString(formData.get('feedback'));
      break;
    }
    case 'comment': {
      formString(formData.get('id'));
      formString(formData.get('comment'));
      break;
    }
  }

  return undefined;
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestMatchesResult = await getRequestService().getRequestMatches(
    parseInt(params.requestId),
    session.authState.accessToken,
  );

  const requestMatches = requestMatchesResult.into()?.content ?? [];

  const matchFeedbacks = await getMatchFeedbackService().listAllLocalized(lang);

  return {
    documentTitle: t('app:matches.page-title'),
    lang,
    matchFeedbacks,
    requestMatches,
    requestId: requestData.id,
    requestStatus: requestData.status,
    branch: lang === 'en' ? requestData.workUnit?.parent?.nameEn : requestData.workUnit?.parent?.nameFr,
    requestDate: requestData.createdDate,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    hiringManager: {
      firstName: requestData.hiringManager?.firstName,
      lastName: requestData.hiringManager?.lastName,
      email: requestData.hiringManager?.businessEmailAddress,
    },
    hrAdvisor: {
      firstName: requestData.hrAdvisor?.firstName,
      lastName: requestData.hrAdvisor?.lastName,
      email: requestData.hrAdvisor?.businessEmailAddress,
    },
    confirmRetraining: false, // TODO: fix it in separate pr
    feedbackSubmitted: false, // TODO: check the request status to determine it this is true or false, fix it in separate pr
    feedbackProgress: 10, // TODO: fix it in separate pr
    // requestMatches.length > 0 ? (requestMatches.filter((match) => match.approval).length / requestMatches.length) * 100 : 0, // TODO: fix it in separate pr
  };
}

export default function HiringManagerRequestMatches({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const alertRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const matchesFetcher = useFetcher();
  const isUpdating = matchesFetcher.state !== 'idle';

  const [browserTZ, setBrowserTZ] = useState(() =>
    loaderData.requestDate
      ? formatDateTimeForTimezone(loaderData.requestDate, loaderData.baseTimeZone, loaderData.lang)
      : '0000-00-00 00:00',
  );

  useEffect(() => {
    if (!loaderData.requestDate) return;

    const browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTZ) {
      setBrowserTZ(formatDateTimeForTimezone(loaderData.requestDate, browserTZ, loaderData.lang));
    }
  }, [loaderData.requestDate, loaderData.lang]);

  return (
    <div className="mb-8 space-y-4">
      <VacmanBackground variant="top-right">
        {loaderData.requestStatus && (
          <RequestStatusTag rounded status={loaderData.requestStatus} lang={loaderData.lang} view="hiring-manager" />
        )}
        <PageTitle className="after:w-14" subTitle={loaderData.branch}>
          {t('app:matches.referral-request')}
        </PageTitle>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p>{t('app:matches.request-id')}</p>
            <p className="text-[#9FA3AD]">{loaderData.requestId}</p>
          </div>
          <div>
            <p>{t('app:matches.request-date')}</p>
            <p className="text-[#9FA3AD]">{browserTZ}</p>
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
        file="routes/hiring-manager/request/index.tsx"
        params={params}
        disabled={isSubmitting}
      >
        {t('app:matches.back-request-details')}
      </BackLink>
      <h2 className="font-lato mt-4 text-2xl font-bold">{t('app:matches.request-candidates')}</h2>
      <p className="sm:w-2/3 md:w-3/4">{t('app:matches.page-info')}</p>
      {loaderData.feedbackSubmitted ? (
        <AlertMessage ref={alertRef} type="success" role="alert" ariaLive="assertive">
          <p className="font-semibold">{t('app:matches.feedback.success')}</p>
        </AlertMessage>
      ) : (
        <fetcher.Form method="post" noValidate>
          <div className="mt-10 justify-between md:grid md:grid-cols-2">
            <InputCheckbox
              id="confirm-retraining"
              name="confirmRetraining"
              defaultChecked={loaderData.confirmRetraining}
              required
            >
              {t('app:matches.confirm-info')}
            </InputCheckbox>
            <div className="flex justify-end space-x-3">
              <Button variant="alternative" type="submit" value="save" name="action">
                {t('app:form.save-and-exit')}
              </Button>
              <Button variant="primary" type="submit" value="submit" name="action">
                {t('app:form.submit')}
              </Button>
            </div>
          </div>
        </fetcher.Form>
      )}
      <Progress className="mt-8 mb-8" variant="blue" label="" value={loaderData.feedbackProgress} />
      <MatchesTables {...loaderData} submit={matchesFetcher.submit} view="hiring-manager" isUpdating={isUpdating} />
    </div>
  );
}
