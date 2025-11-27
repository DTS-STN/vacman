import { useEffect, useRef } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/matches';

import type { MatchReadModel, MatchSummaryReadModel, MatchUpdateModel } from '~/.server/domain/models';
import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { wfaStatusService } from '~/.server/domain/services/wfa-status-service-default';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { mapMatchToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { InputCheckbox } from '~/components/input-checkbox';
import { AnchorLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { Progress } from '~/components/progress';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { REQUEST_EVENT_TYPE, REQUEST_STATUS_CODE } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { useFormattedDate } from '~/hooks/use-formatted-date';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import MatchesTables from '~/routes/page-components/requests/matches-tables';
import { formatWithMask, formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  // Get request id from params.
  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestMatchesResult = await getRequestService().getRequestMatches(
    parseInt(params.requestId),
    { page: 0 },
    session.authState.accessToken,
  );

  if (requestMatchesResult.isErr()) {
    throw new Response('Request matches not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestMatches = requestMatchesResult.unwrap().content;

  const requestId = requestData.id;
  const allFeedbacks = await getMatchFeedbackService().listAll();
  const formData = await request.formData();

  switch (formData.get('action')) {
    case 'save': {
      return i18nRedirect('routes/hiring-manager/request/index.tsx', request, {
        params,
        search: new URLSearchParams({ success: 'save-request' }),
      });
    }
    case 'submit': {
      const matchesSubmitSchema = v.object({
        confirmRetraining: v.pipe(v.boolean('app:matches.errors.retraining-required')),
        feedbackMissing: v.custom((val) => val === false, 'app:matches.errors.feedback-missing'),
      });

      const parseResult = v.safeParse(matchesSubmitSchema, {
        confirmRetraining: formData.get('confirmRetraining') === 'on' ? true : undefined,
        feedbackMissing: requestMatches.some((match) => match.matchFeedback === undefined),
      });

      if (!parseResult.success) {
        return data(
          { errors: v.flatten<typeof matchesSubmitSchema>(parseResult.issues).nested },
          { status: HttpStatusCodes.BAD_REQUEST },
        );
      }

      const requestResult = await getRequestService().updateRequestStatus(
        requestId,
        {
          eventType: REQUEST_EVENT_TYPE.submitFeedback,
        },
        session.authState.accessToken,
      );

      if (requestResult.isErr()) {
        throw requestResult.unwrapErr();
      }

      return data({ success: true, errors: undefined });
    }
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

      return data({ success: true, errors: undefined });
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
        hiringManagerComment: parseResult.output.comment,
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

      return data({ success: true, errors: undefined });
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

  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.getAll('sort');
  const requestMatchesResult = await getRequestService().getRequestMatches(
    parseInt(params.requestId),
    {
      page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
      sort: sortParam.length > 0 ? sortParam : undefined,
      profile: {
        employeeName: searchParams.get('employeeName') ?? undefined,
        wfaStatusId: searchParams.getAll('wfaStatusId').map((id) => parseInt(id)),
      },
      matchFeedbackId: searchParams.getAll('matchFeedbackId').map((id) => parseInt(id)),
    },
    session.authState.accessToken,
  );
  if (requestMatchesResult.isErr()) {
    throw requestMatchesResult.unwrapErr();
  }

  const wfaStatuses = await wfaStatusService.listAll();

  const { content: requestMatches, page } = requestMatchesResult.unwrap();

  const matchFeedbacks = await getMatchFeedbackService().listAllLocalized(lang);

  function getFeedbackProgress(requestMatches: MatchSummaryReadModel[]): number {
    if (requestMatches.length === 0) return 0;
    const count = requestMatches.filter((match) => match.matchFeedback).length;
    return (count / requestMatches.length) * 100;
  }

  return {
    documentTitle: t('app:matches.page-title'),
    lang,
    matchFeedbacks,
    requestMatches,
    wfaStatuses,
    requestId: requestData.id,
    requestIdFormatted: formatWithMask(requestData.id, '####-####-##'),
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
    feedbackSubmitted: requestData.status?.code === REQUEST_STATUS_CODE.FDBK_PEND_APPR,
    feedbackProgress: getFeedbackProgress(requestMatches),
    search: searchParams.toString(),
    page,
  };
}

export default function HiringManagerRequestMatches({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const alertRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const matchesFetcher = useFetcher();
  const isUpdating = matchesFetcher.state !== 'idle';
  const formErrors = fetcher.data?.errors;
  const requestDate = useFormattedDate(loaderData.requestDate, loaderData.baseTimeZone);

  useEffect(() => {
    if ((formErrors?.confirmRetraining || formErrors?.feedbackMissing) && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      sectionRef.current.focus();
    }
  }, [formErrors?.confirmRetraining, formErrors?.feedbackMissing]);

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
            <p className="text-[#9FA3AD]">{loaderData.requestIdFormatted}</p>
          </div>
          <div>
            <p>{t('app:matches.request-date')}</p>
            <p className="text-[#9FA3AD]">{requestDate}</p>
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

      {(formErrors?.confirmRetraining ?? formErrors?.feedbackMissing) && (
        <section
          ref={sectionRef}
          className="my-5 border-4 border-red-600 p-4"
          tabIndex={-1}
          aria-live="assertive"
          aria-atomic={true}
          role="alert"
        >
          <h2 className="font-lato text-lg font-semibold">
            {t('gcweb:error-summary.header', {
              count: (formErrors.confirmRetraining ? 1 : 0) + (formErrors.feedbackMissing ? 1 : 0),
            })}
          </h2>
          <ol className="mt-1.5 list-decimal space-y-2 pl-7">
            {formErrors.confirmRetraining && (
              <li>
                <AnchorLink
                  className="text-red-700 underline hover:decoration-2 focus:decoration-2"
                  anchorElementId="input-checkbox-confirm-retraining-input"
                >
                  {t(extractValidationKey(formErrors.confirmRetraining))}
                </AnchorLink>
              </li>
            )}
            {formErrors.feedbackMissing && (
              <li>
                <AnchorLink
                  className="text-red-700 underline hover:decoration-2 focus:decoration-2"
                  anchorElementId="feedback-column-header"
                >
                  {t(extractValidationKey(formErrors.feedbackMissing))}
                </AnchorLink>
              </li>
            )}
          </ol>
        </section>
      )}

      <h2 className="font-lato mt-4 text-2xl font-bold">{t('app:matches.request-candidates')}</h2>
      <p className="sm:w-2/3 md:w-3/4">{t('app:matches.page-info.hiring-manager')}</p>

      {loaderData.feedbackSubmitted ? (
        <AlertMessage ref={alertRef} type="success" role="alert" ariaLive="assertive">
          <p className="font-semibold">{t('app:matches.feedback.success')}</p>
        </AlertMessage>
      ) : (
        <fetcher.Form method="post" noValidate>
          <div className="mt-10 justify-between space-y-5 md:flex md:space-y-0">
            <div className="md:w-1/2">
              <InputCheckbox
                id="confirm-retraining"
                name="confirmRetraining"
                errorMessage={t(extractValidationKey(formErrors?.confirmRetraining))}
                required
              >
                {t('app:matches.confirm-info')}
              </InputCheckbox>
            </div>
            <div className="flex">
              <div className="mt-auto flex w-full flex-col justify-end space-y-5 sm:flex-row sm:flex-nowrap sm:space-y-0 sm:space-x-3">
                <ButtonLink
                  variant="alternative"
                  file="routes/export/matches.ts"
                  search={loaderData.search}
                  params={params}
                  className="space-x-1"
                  reloadDocument
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>{t('gcweb:download.label')}</span>
                </ButtonLink>
                <Button variant="alternative" type="submit" value="save" name="action">
                  {t('app:form.save-and-exit')}
                </Button>
                <Button variant="primary" type="submit" value="submit" name="action">
                  {t('app:form.submit')}
                </Button>
              </div>
            </div>
          </div>
        </fetcher.Form>
      )}
      {!loaderData.feedbackSubmitted && (
        <Progress
          className="mt-8 mb-8"
          variant="blue"
          label={t('app:matches.feedback-completion-progress')}
          value={loaderData.feedbackProgress}
        />
      )}
      <MatchesTables {...loaderData} submit={matchesFetcher.submit} view="hiring-manager" isUpdating={isUpdating} />
    </div>
  );
}
