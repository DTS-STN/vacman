import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/requests-tables';
import type { Route } from './+types/requests';

import type { RequestQueryParams } from '~/.server/domain/models';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates, workUnitIdsFromBranchIds } from '~/.server/utils/directorate-utils';
import {
  fetchRequestsWithClassificationFallback,
  resolveClassificationSearch,
} from '~/.server/utils/request-classification-utils';
import { BackLink } from '~/components/back-link';
import { PageTitle } from '~/components/page-title';
import { REQUEST_CATEGORY, REQUEST_STATUS_CODE, REQUEST_STATUSES } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { removeNumberMask } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const currentUserResult = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserResult.unwrap();

  const classifications = await getClassificationService().listAllLocalized(lang);
  const directorates = await getWorkUnitService().listAllLocalized(lang);
  const searchParams = new URL(request.url).searchParams;
  const requestService = getRequestService();

  // Active requests query, either 'me' or 'all' requests
  const activeSortParam = searchParams.getAll('activeSort');
  const activeStatusIds = searchParams.getAll('activeStatus');
  const activeClassificationFilter = resolveClassificationSearch(searchParams.getAll('activeGroup'), classifications);
  const inactiveClassificationFilter = resolveClassificationSearch(searchParams.getAll('inactiveGroup'), classifications);

  const activeRequestsQuery: RequestQueryParams = {
    page: Math.max(1, Number.parseInt(searchParams.get('activePage') ?? '1', 10) || 1),
    statusId:
      activeStatusIds.length > 0
        ? activeStatusIds.filter((id) =>
            REQUEST_STATUSES.filter(
              (req) => req.category === REQUEST_CATEGORY.active && req.code !== REQUEST_STATUS_CODE.DRAFT,
            ).find((req) => req.id.toString() === id),
          )
        : REQUEST_STATUSES.filter(
            (req) => req.category === REQUEST_CATEGORY.active && req.code !== REQUEST_STATUS_CODE.DRAFT,
          ).map((req) => req.id.toString()),
    workUnitId: workUnitIdsFromBranchIds(directorates, searchParams.getAll('activeBranch')),
    hrAdvisorId: searchParams.get('filter') === 'me' ? ['me'] : undefined,
    classificationId: activeClassificationFilter.classificationIds,
    requestId: removeNumberMask(searchParams.get('activeId') ?? undefined)?.toString(),
    sort: activeSortParam.length > 0 ? activeSortParam : undefined,
    size: 10,
  };

  // Inactive requests query
  const inactiveSortParam = searchParams.getAll('inactiveSort');
  const inactiveStatusIds = searchParams.getAll('inactiveStatus');
  const inactiveRequestsQuery: RequestQueryParams = {
    page: Math.max(1, Number.parseInt(searchParams.get('inactivePage') ?? '1', 10) || 1),
    statusId:
      inactiveStatusIds.length > 0
        ? inactiveStatusIds.filter((id) =>
            REQUEST_STATUSES.filter(
              (req) => req.category === REQUEST_CATEGORY.inactive && req.code !== REQUEST_STATUS_CODE.DRAFT,
            ).find((req) => req.id.toString() === id),
          )
        : REQUEST_STATUSES.filter(
            (req) => req.category === REQUEST_CATEGORY.inactive && req.code !== REQUEST_STATUS_CODE.DRAFT,
          ).map((req) => req.id.toString()),
    workUnitId: workUnitIdsFromBranchIds(directorates, searchParams.getAll('inactiveBranch')),
    hrAdvisorId: searchParams.get('filter') === 'me' ? ['me'] : undefined,
    classificationId: inactiveClassificationFilter.classificationIds,
    requestId: removeNumberMask(searchParams.get('inactiveId'))?.toString(),
    sort: inactiveSortParam.length > 0 ? inactiveSortParam : undefined,
    size: 10,
  };

  const activeRequestsData = await fetchRequestsWithClassificationFallback({
    filter: activeClassificationFilter,
    query: activeRequestsQuery,
    fetcher: (params) => requestService.getRequests(params, session.authState.accessToken),
  });

  const inactiveRequestsData = await fetchRequestsWithClassificationFallback({
    filter: inactiveClassificationFilter,
    query: inactiveRequestsQuery,
    fetcher: (params) => requestService.getRequests(params, session.authState.accessToken),
  });

  const requestStatuses = (await getRequestStatusService().listAllLocalized(lang))
    .filter((s) => s.code !== REQUEST_STATUS_CODE.DRAFT)
    .map((status) =>
      status.code === REQUEST_STATUS_CODE.SUBMIT
        ? {
            ...status,
            name: t('app:hr-advisor-referral-requests.status.request-pending-approval'),
          }
        : status,
    )
    .toSorted((a, b) => a.name.localeCompare(b.name, lang));
  const workUnits = extractUniqueBranchesFromDirectorates(directorates);

  const { content: activeBaseRequests, page: activeRequestsPage } = activeRequestsData;
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

  const { content: inactiveBaseRequests, page: inactiveRequestsPage } = inactiveRequestsData;
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
    requestStatuses,
    classifications,
    workUnits,
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
