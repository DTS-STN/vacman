import type { RouteHandle } from 'react-router';

import { faUser } from '@fortawesome/free-solid-svg-icons';
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
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  if (!context.session.currentUser) {
    try {
      const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
      context.session.currentUser = currentUser.unwrap();
    } catch {
      const language = await getLanguageForCorrespondenceService().findById(LANGUAGE_ID[getLanguage(request) ?? 'en']);
      const languageId = language.unwrap().id;
      const currentUser = await getUserService().registerCurrentUser({ languageId }, context.session.authState.accessToken);
      context.session.currentUser = currentUser.unwrap();
    }
  }

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:hr-advisor-dashboard.page-title') };
}

export default function EmployeeDashboard() {
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
        <PageTitle className="after:w-14">{t('app:hr-advisor-dashboard.page-heading')}</PageTitle>
        <div className="grid gap-4">
          <DashboardCard file="routes/hr-advisor/employees.tsx" icon={faUser} title={t('app:hr-advisor-dashboard.employees')} />
        </div>
      </div>
    </div>
  );
}
