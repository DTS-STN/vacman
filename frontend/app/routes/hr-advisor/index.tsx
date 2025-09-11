import type { RouteHandle } from 'react-router';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { DashboardCard } from '~/components/dashboard-card';
import { PageTitle } from '~/components/page-title';
import { LANGUAGE_ID } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { getLanguage } from '~/utils/i18n-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
  layoutHasDecorativeBackground: true,
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
  if (currentUser.isNone()) {
    const language = await getLanguageForCorrespondenceService().findById(LANGUAGE_ID[getLanguage(request) ?? 'en']);
    await getUserService().registerCurrentUser({ languageId: language.unwrap().id }, context.session.authState.accessToken);
  }

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:hr-advisor-dashboard.page-title') };
}

export default function EmployeeDashboard() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <PageTitle>{t('app:hr-advisor-dashboard.page-heading')}</PageTitle>
      <div className="grid gap-4">
        <DashboardCard
          file="routes/hr-advisor/employees.tsx"
          search="filter=me"
          icon={faUser}
          title={t('app:hr-advisor-dashboard.employees')}
        />
        <DashboardCard
          file="routes/hr-advisor/requests.tsx"
          icon={faMagnifyingGlass}
          iconFlip="horizontal"
          title={t('app:hr-advisor-dashboard.requests')}
        />
      </div>
    </>
  );
}
