import { useRef } from 'react';
import type { JSX } from 'react';

import { data, useFetcher, useSearchParams } from 'react-router';
import type { RouteHandle } from 'react-router';

import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/matches';

import type {
  LookupModel,
  MatchReadModel,
  MatchSummaryReadModel,
  MatchUpdateModel,
  PageMetadata,
} from '~/.server/domain/models';
import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { wfaStatusService } from '~/.server/domain/services/wfa-status-service-default';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { mapMatchToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { ButtonLink } from '~/components/button-link';
import { InlineLink } from '~/components/links';
import { LoadingLink } from '~/components/loading-link';
import { PageTitle } from '~/components/page-title';
import { Progress } from '~/components/progress';
import { Column, ColumnOptions, ColumnSearch, ServerTable } from '~/components/server-table';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import { MATCH_STATUS, REQUEST_STATUS_CODE } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFormattedDate } from '~/hooks/use-formatted-date';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import MatchesTables from '~/routes/page-components/requests/matches-tables';
import { formatWithMask, formString } from '~/utils/string-utils';

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

      const matchResult = await getRequestService().getRequestMatchById(requestId, matchId, session.authState.accessToken);

      if (matchResult.isErr()) {
        throw new Response('Request Match not found', { status: HttpStatusCodes.NOT_FOUND });
      }

      const matchData: MatchReadModel = matchResult.unwrap();

      const approveRequestResult = await getRequestService().approveRequestMatch(
        requestId,
        matchId,
        session.authState.accessToken,
      );

      if (approveRequestResult.isErr()) {
        throw approveRequestResult.unwrapErr();
      }

      const employeeName = matchData.profile?.profileUser
        ? `${matchData.profile.profileUser.firstName ?? ''} ${matchData.profile.profileUser.lastName ?? ''}`.trim()
        : 'Unknown User';
      return data({ success: true, action: 'approve', employeeName });
    }

    case 'revert-approval': {
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

      const matchResult = await getRequestService().getRequestMatchById(requestId, matchId, session.authState.accessToken);

      if (matchResult.isErr()) {
        throw new Response('Request Match not found', { status: HttpStatusCodes.NOT_FOUND });
      }

      const matchData: MatchReadModel = matchResult.unwrap();

      const revertApproveRequestResult = await getRequestService().revertApproveRequestMatch(
        requestId,
        matchId,
        session.authState.accessToken,
      );

      if (revertApproveRequestResult.isErr()) {
        throw revertApproveRequestResult.unwrapErr();
      }

      const employeeName = matchData.profile?.profileUser
        ? `${matchData.profile.profileUser.firstName ?? ''} ${matchData.profile.profileUser.lastName ?? ''}`.trim()
        : 'Unknown User';
      return data({ success: true, action: 'revert-approval', employeeName });
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

  function getApprovalProgress(requestMatches: MatchSummaryReadModel[]): number {
    if (requestMatches.length === 0) return 0;
    const count = requestMatches.filter((match) => match.matchStatus?.code === MATCH_STATUS.APPROVED.code).length;
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
    approvalProgress: getApprovalProgress(requestMatches),
    search: searchParams.toString(),
    page,
  };
}

export default function HrAdvisorMatches({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const alertRef = useRef<HTMLDivElement>(null);
  const matchesFetcher = useFetcher();
  const isUpdating = matchesFetcher.state !== 'idle';
  const requestDate = useFormattedDate(loaderData.requestDate, loaderData.baseTimeZone);

  // Handle success messages for approve/revert-approval actions
  const getSuccessMessage = () => {
    if (matchesFetcher.data?.success && matchesFetcher.data?.action && matchesFetcher.data?.employeeName) {
      const { action, employeeName } = matchesFetcher.data;
      if (action === 'approve') {
        return t('app:matches-tables.approved-successfully-msg', { name: employeeName });
      } else if (action === 'revert-approval') {
        return t('app:matches-tables.revert-approval-successfully-msg', { name: employeeName });
      }
    }
    return null;
  };

  const successMessage = getSuccessMessage();

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
        file="routes/hr-advisor/request/index.tsx"
        params={params}
      >
        {t('app:matches.back-request-details')}
      </BackLink>
      <div className="mb-10 justify-between space-y-5 sm:flex sm:space-y-0">
        <div className="col-span-4 flex flex-col justify-end space-y-2">
          <h2 className="font-lato mt-4 text-2xl font-bold">{t('app:matches.request-candidates')}</h2>
          {loaderData.feedbackSubmitted ? (
            <p className="sm:w-2/3 md:w-3/4">{t('app:matches.page-info.hr-advisor')}</p>
          ) : (
            <p className="sm:w-2/3 md:w-3/4">{t('app:matches.matches-available-hr-advisor-detail')}</p>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <ButtonLink
            variant="alternative"
            file="routes/export/matches.ts"
            search={loaderData.search}
            params={params}
            className="w-1/2 space-x-1 sm:w-auto"
            reloadDocument
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>{t('gcweb:download.label')}</span>
          </ButtonLink>
        </div>
      </div>

      {successMessage && (
        <AlertMessage ref={alertRef} type="success" role="alert" ariaLive="assertive">
          {successMessage}
        </AlertMessage>
      )}

      {loaderData.approvalProgress >= 100 && (
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
      )}
      {loaderData.feedbackSubmitted && loaderData.approvalProgress < 100 && (
        <Progress
          className="mt-8 mb-8"
          variant="blue"
          label={t('app:matches.approval-completion-progress')}
          value={loaderData.approvalProgress}
        />
      )}
      {loaderData.feedbackSubmitted ? (
        <MatchesTables
          {...loaderData}
          submit={matchesFetcher.submit}
          view="hr-advisor"
          isUpdating={isUpdating}
          errors={matchesFetcher.data?.errors}
        />
      ) : (
        <DisplayCandidatesTable {...loaderData} />
      )}
    </div>
  );
}
interface DisplayCandidatesTableProps {
  requestMatches: MatchSummaryReadModel[];
  wfaStatuses: readonly Readonly<LookupModel>[];
  requestId: number;
  lang: 'en' | 'fr';
  page: PageMetadata;
}

function DisplayCandidatesTable({
  requestMatches,
  wfaStatuses,
  requestId,
  lang,
  page,
}: DisplayCandidatesTableProps): JSX.Element {
  const { t } = useTranslation('app');
  const [searchParams, setSearchParams] = useSearchParams({ filter: 'all' });

  return (
    <section className="mb-8">
      <ServerTable page={page} data={requestMatches} searchParams={searchParams} setSearchParams={setSearchParams}>
        <Column
          accessorKey="employeeName"
          accessorFn={(row: MatchSummaryReadModel) => `${row.profile?.firstName} ${row.profile?.lastName}`}
          header={({ column }) => (
            <ColumnSearch
              column={column}
              title={t('matches-tables.employee')}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
          cell={(info) => {
            const profile = info.row.original.profile;
            const profileId = profile?.id;
            const employeeName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

            // Only render link if profileId exists
            if (!profileId) {
              return <span>{employeeName || '-'}</span>;
            }

            return (
              <LoadingLink
                className="text-sky-800 no-underline decoration-slate-400 decoration-2 hover:underline"
                file={`routes/hr-advisor/request/profile.tsx`}
                params={{ requestId: requestId.toString(), profileId: profileId.toString() }}
                aria-label={`${t('matches-tables.employee')} ${profile.firstName} ${profile.lastName}`}
                search={searchParams}
              >
                {employeeName || '-'}
              </LoadingLink>
            );
          }}
        />
        <Column
          accessorKey="wfaStatusId"
          accessorFn={(row: MatchSummaryReadModel) =>
            (lang === 'en' ? row.profile?.wfaStatus?.nameEn : row.profile?.wfaStatus?.nameFr) ?? '-'
          }
          header={({ column }) => (
            <ColumnOptions
              column={column}
              title={t('matches-tables.wfa-status')}
              options={wfaStatuses}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              showClearAll
            />
          )}
          cell={(info) => {
            return (
              <p>
                {lang === 'en'
                  ? (info.row.original.profile?.wfaStatus?.nameEn ?? '-')
                  : (info.row.original.profile?.wfaStatus?.nameFr ?? '-')}
              </p>
            );
          }}
        />
      </ServerTable>
    </section>
  );
}
