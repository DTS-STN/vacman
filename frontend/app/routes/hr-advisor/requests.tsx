import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/requests-tables';
import type { Route } from './+types/requests';

import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { BackLink } from '~/components/back-link';
import { PageTitle } from '~/components/page-title';
import { REQUEST_CATEGORY, REQUEST_STATUS_CODE, REQUEST_STATUSES } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t } = await getTranslation(request, handle.i18nNamespace);

  const currentUserResult = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserResult.unwrap();

  const searchParams = new URL(request.url).searchParams;

  // Active requests query, either 'me' or 'all' requests
  const activeRequestsQuery = {
    page: Math.max(1, Number.parseInt(searchParams.get('activepage') ?? '1', 10) || 1),
    statusId: REQUEST_STATUSES.filter(
      (s) => s.category === REQUEST_CATEGORY.active && s.code !== REQUEST_STATUS_CODE.DRAFT,
    ).map((s) => s.id.toString()),
    size: 10,
  };
  const activeRequestsResult = await (searchParams.get('filter') === 'me'
    ? getRequestService().getCurrentUserRequests(activeRequestsQuery, session.authState.accessToken)
    : getRequestService().getRequests(activeRequestsQuery, session.authState.accessToken));
  if (activeRequestsResult.isErr()) {
    throw activeRequestsResult.unwrapErr();
  }

  // Inactive requests query
  const inactiveRequestsQuery = {
    page: Math.max(1, Number.parseInt(searchParams.get('inactivepage') ?? '1', 10) || 1),
    statusId: REQUEST_STATUSES.filter((s) => s.category === REQUEST_CATEGORY.inactive).map((s) => s.id.toString()),
    size: 10,
  };
  const inactiveRequestsResult = await (searchParams.get('filter') === 'me'
    ? getRequestService().getCurrentUserRequests(inactiveRequestsQuery, session.authState.accessToken)
    : getRequestService().getRequests(inactiveRequestsQuery, session.authState.accessToken));
  if (inactiveRequestsResult.isErr()) {
    throw inactiveRequestsResult.unwrapErr();
  }

  const { content: activeBaseRequests, page: activeRequestsPage } = activeRequestsResult.unwrap();
  const activeRequests = activeBaseRequests.map((req) =>
    //Replace REQUEST_STATUS_CODE.SUBMIT name with "Request pending approval" for table filtering
    req.status?.code === REQUEST_STATUS_CODE.SUBMIT
      ? {
          ...req,
          status: {
            ...req.status,
            nameEn: t('app:hr-advisor-referral-requests.status.request-pending-approval', { lng: 'en' }),
            nameFr: t('app:hr-advisor-referral-requests.status.request-pending-approval', { lng: 'fr' }),
          },
        }
      : req,
  );

  const { content: inactiveBaseRequests, page: inactiveRequestsPage } = inactiveRequestsResult.unwrap();
  const inactiveRequests = inactiveBaseRequests.map((req) =>
    //Replace REQUEST_STATUS_CODE.SUBMIT name with "Request pending approval" for table filtering
    req.status?.code === REQUEST_STATUS_CODE.SUBMIT
      ? {
          ...req,
          status: {
            ...req.status,
            nameEn: t('app:hr-advisor-referral-requests.status.request-pending-approval', { lng: 'en' }),
            nameFr: t('app:hr-advisor-referral-requests.status.request-pending-approval', { lng: 'fr' }),
          },
        }
      : req,
  );

  return {
    documentTitle: t('app:hr-advisor-requests.page-title'),
    activeRequests,
    activeRequestsPage,
    inactiveRequests,
    inactiveRequestsPage,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    userId: currentUser.id,
  };
}

export default function HrAdvisorRequests({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8 space-y-4">
      <PageTitle className="after:w-14">{t('app:hr-advisor-requests.page-title')}</PageTitle>
      <BackLink
        aria-label={t('app:hr-advisor-employees-table.back-to-dashboard')}
        file="routes/hr-advisor/index.tsx"
        params={params}
      >
        {t('app:hr-advisor-employees-table.back-to-dashboard')}
      </BackLink>
      <RequestsTables {...loaderData} view="hr-advisor" />
    </div>
  );
}
