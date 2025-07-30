import type { RouteHandle, LoaderFunctionArgs, MetaFunction } from 'react-router';

import { faMagnifyingGlass, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { DashboardCard } from '~/components/dashboard-card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const currentUrl = new URL(request.url);
  // Check if the user is authenticated (no specific roles required)
  requireAuthentication(context.session, currentUrl);

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:hr-advisor-dashboard.page-title') };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function HRAdvisorDashboard() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="flex h-screen">
      <aside className="absolute inset-y-0 right-0 z-0 hidden w-2/5 bg-[rgba(9,28,45,1)] sm:block">
        <div
          role="presentation"
          className="absolute top-0 right-0 size-1/2 w-full bg-[url('/VacMan-design-element-07.svg')] bg-contain bg-top bg-no-repeat"
        />
        <div
          role="presentation"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[url('/VacMan-design-element-06.svg')] bg-contain bg-bottom bg-no-repeat"
        />
      </aside>
      <div className="mb-8 w-full px-4 sm:w-3/5 sm:px-6">
        <PageTitle className="after:w-14">{t('app:index.get-started')}</PageTitle>
        <div className="grid gap-4">
          <DashboardCard
            href={'routes/hr-advisor/employees.tsx'}
            icon={faUserPlus}
            title={t('app:hr-advisor-dashboard.employees')}
          />
          <DashboardCard
            href={'routes/hr-advisor/requests.tsx'}
            icon={faMagnifyingGlass}
            title={t('app:hr-advisor-dashboard.requests')}
          />
        </div>
      </div>
    </div>
  );
}
