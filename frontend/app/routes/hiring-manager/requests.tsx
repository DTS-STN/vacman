import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/tables/requests-tables';
import type { Route } from './+types/requests';

import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { PageTitle } from '~/components/page-title';
import { REQUEST_CATEGORY, REQUEST_STATUSES } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const newRequestResult = await getRequestService().createRequest(context.session.authState.accessToken);
  const requestId = newRequestResult.into()?.id.toString();

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params: { requestId } });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const requestsResult = await getRequestService().getCurrentUserRequests(context.session.authState.accessToken);
  const requests = requestsResult.into()?.content ?? [];

  const activeRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.active),
  );

  const archivedRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.inactive),
  );

  const requestStatuses = await getRequestStatusService().listAllLocalized(lang);

  const activeRequestNames = requestStatuses
    .filter((req) => REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.active))
    .map(({ name }) => name);

  const inactiveRequestNames = requestStatuses
    .filter((req) => REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.active))
    .map(({ name }) => name);

  return {
    documentTitle: t('app:hiring-manager-requests.page-title'),
    activeRequests,
    archivedRequests,
    activeRequestNames,
    inactiveRequestNames,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
  };
}

export default function HiringManagerRequests({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8 space-y-4">
      <PageTitle className="after:w-14">{t('app:hiring-manager-requests.page-title')}</PageTitle>
      <RequestsTables {...loaderData} view="hiring-manager" />
    </div>
  );
}
