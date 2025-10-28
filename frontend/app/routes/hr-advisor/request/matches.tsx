import { useEffect, useRef, useState } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/matches';

import type { MatchReadModel, MatchSummaryReadModel, MatchUpdateModel } from '~/.server/domain/models';
import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { mapMatchToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { Progress } from '~/components/progress';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { MATCH_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
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

export async function action({ context, request, params }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const allFeedbacks = await getMatchFeedbackService().listAll();

  // Get request id from params.
  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestId = requestData.id;

  const formData = await request.formData();

  switch (formData.get('action')) {
    case 'feedback': {
      const parseResult = v.safeParse(
        v.object({
          matchId: v.pipe(
            v.string(),
            v.transform((val) => parseInt(val, 10)),
            v.number('app:matches.errors.match-id'),
          ),
          feedback: v.pipe(
            stringToIntegerSchema('app:matches.errors.feedback-required'),
            v.picklist(
              allFeedbacks.map(({ id }) => id),
              'app:matches.errors.feedback-required',
            ),
          ),
        }),
        {
          matchId: formString(formData.get('matchId')),
          feedback: formString(formData.get('feedback')),
        },
      );

      if (!parseResult.success) {
        return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
      }

      const { matchId } = parseResult.output;
      const matchResult = await getRequestService().getRequestMatchById(requestId, matchId, session.authState.accessToken);

      if (matchResult.isErr()) {
        throw new Response('Request Match not found', { status: HttpStatusCodes.NOT_FOUND });
      }

      const matchData: MatchReadModel = matchResult.unwrap();

      // call PUT /api/v1/requests/{id}/matches/{matchId} to update feedback
      const matchPayload: MatchUpdateModel = mapMatchToUpdateModelWithOverrides(matchData, {
        matchFeedbackId: parseResult.output.feedback,
      });
      const updateResult = await getRequestService().updateRequestMatchById(
        requestId,
        matchData.id,
        matchPayload,
        session.authState.accessToken,
      );

      if (updateResult.isErr()) {
        throw updateResult.unwrapErr();
      }

      return data({ success: true });
    }
    case 'comment': {
      const parseResult = v.safeParse(
        v.object({
          matchId: v.pipe(
            v.string(),
            v.transform((val) => parseInt(val, 10)),
            v.number('app:matches.errors.match-id'),
          ),
          comment: v.optional(
            v.pipe(
              v.string('app:matches.errors.comment-required'),
              v.trim(),
              v.maxLength(100, 'app:matches.errors.comment-max-length'),
            ),
          ),
        }),
        {
          matchId: formString(formData.get('matchId')),
          comment: formString(formData.get('comment')),
        },
      );

      if (!parseResult.success) {
        return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
      }

      const { matchId } = parseResult.output;
      const matchResult = await getRequestService().getRequestMatchById(requestId, matchId, session.authState.accessToken);

      if (matchResult.isErr()) {
        throw new Response('Request Match not found', { status: HttpStatusCodes.NOT_FOUND });
      }

      const matchData: MatchReadModel = matchResult.unwrap();

      // call PUT /api/v1/requests/{id}/matches/{matchId} to update HR advisor comment
      const matchPayload: MatchUpdateModel = mapMatchToUpdateModelWithOverrides(matchData, {
        hrAdvisorComment: parseResult.output.comment,
      });
      const updateResult = await getRequestService().updateRequestMatchById(
        requestId,
        matchData.id,
        matchPayload,
        session.authState.accessToken,
      );

      if (updateResult.isErr()) {
        throw updateResult.unwrapErr();
      }

      return data({ success: true });
    }
    case 'approve': {
      const parseResult = v.safeParse(
        v.object({
          matchId: v.pipe(
            v.string(),
            v.transform((val) => parseInt(val, 10)),
            v.number('app:matches.errors.match-id'),
          ),
        }),
        {
          matchId: formString(formData.get('matchId')),
        },
      );

      if (!parseResult.success) {
        return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
      }
      const { matchId } = parseResult.output;

      const approveRequestResult = await getRequestService().approveRequestMatch(
        requestId,
        matchId,
        session.authState.accessToken,
      );

      if (approveRequestResult.isErr()) {
        throw approveRequestResult.unwrapErr();
      }

      return data({ success: true });
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

  function getFeedbackProgress(requestMatches: MatchSummaryReadModel[]): number {
    if (requestMatches.length === 0) return 0;
    const count = requestMatches.filter((match) => match.matchStatus?.code === MATCH_STATUS.APPROVED.code).length;
    return (count / requestMatches.length) * 100;
  }

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
    feedbackProgress: getFeedbackProgress(requestMatches),
  };
}

export default function HrAdvisorMatches({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const alertRef = useRef<HTMLDivElement>(null);
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
          <RequestStatusTag rounded status={loaderData.requestStatus} lang={loaderData.lang} view="hr-advisor" />
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
        file="routes/hr-advisor/request/index.tsx"
        params={params}
      >
        {t('app:matches.back-request-details')}
      </BackLink>
      <h2 className="font-lato mt-4 text-2xl font-bold">{t('app:matches.request-candidates')}</h2>
      <p className="sm:w-2/3 md:w-3/4">{t('app:matches.page-info')}</p>
      {loaderData.feedbackProgress >= 100 ? (
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
      ) : (
        <Progress className="mt-8 mb-8" variant="blue" label="" value={loaderData.feedbackProgress} />
      )}
      <MatchesTables
        {...loaderData}
        submit={matchesFetcher.submit}
        view="hr-advisor"
        isUpdating={isUpdating}
        errors={matchesFetcher.data?.errors}
      />
    </div>
  );
}
