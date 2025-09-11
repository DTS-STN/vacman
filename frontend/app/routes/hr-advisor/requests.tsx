import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/tables/requests-tables';
import type { Route } from './+types/requests';

import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { BackLink } from '~/components/back-link';
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

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const requestsResult = await getRequestService().getCurrentUserRequests(context.session.authState.accessToken);
  const requests = (requestsResult.into()?.content ?? []).filter((req) => req.status?.code !== 'DRAFT');

  const activeRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.active),
  );

  const archivedRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.inactive),
  );

  const requestStatuses = await getRequestStatusService().listAllLocalized(lang);

  const activeRequestNames = requestStatuses
    .filter((req) =>
      REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.active && req.code !== 'DRAFT'),
    )
    .map(({ name }) => name);

  const inactiveRequestNames = requestStatuses
    .filter((req) => REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.active))
    .map(({ name }) => name);

  return {
    documentTitle: t('app:hr-advisor-requests.page-title'),
    activeRequests,
    archivedRequests,
    activeRequestNames,
    inactiveRequestNames,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
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
