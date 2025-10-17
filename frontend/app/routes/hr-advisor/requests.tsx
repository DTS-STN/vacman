import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/requests-tables';
import type { Route } from './+types/requests';

import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
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

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const currentUserResult = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserResult.unwrap();

  const requestsResult = await getRequestService().getRequests({}, session.authState.accessToken); // TODO: call getRequests with RequestQueryParams
  const requests = (requestsResult.into()?.content ?? [])
    .filter((req) => req.status?.code !== 'DRAFT')
    .map((req) =>
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

  const activeRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.active),
  );

  const inactiveRequests = requests.filter((req) =>
    REQUEST_STATUSES.some((s) => s.code === req.status?.code && s.category === REQUEST_CATEGORY.inactive),
  );

  const requestStatuses = (await getRequestStatusService().listAllLocalized(lang)).map((req) =>
    //Replace REQUEST_STATUS_CODE.SUBMIT name with "Request pending approval" for table filtering
    req.code === REQUEST_STATUS_CODE.SUBMIT
      ? { ...req, name: t('app:hr-advisor-referral-requests.status.request-pending-approval') }
      : req,
  );

  const activeRequestNames = requestStatuses
    .filter((req) =>
      REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.active && req.code !== 'DRAFT'),
    )
    .map((req) => req.name);

  const inactiveRequestNames = requestStatuses
    .filter((req) => REQUEST_STATUSES.some((s) => s.code === req.code && s.category === REQUEST_CATEGORY.inactive))
    .map((req) => req.name);

  return {
    documentTitle: t('app:hr-advisor-requests.page-title'),
    activeRequests,
    inactiveRequests,
    activeRequestNames,
    inactiveRequestNames,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    userId: currentUser.id,
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
