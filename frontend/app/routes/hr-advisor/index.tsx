import type { JSX } from 'react';

import type { RouteHandle, LoaderFunctionArgs, MetaFunction } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { AppLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { LANGUAGE_ID } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { getLanguage } from '~/utils/i18n-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: LoaderFunctionArgs) {
  requireAuthentication(context.session, request);
  if (!context.session.currentUser) {
    try {
      const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
      context.session.currentUser = currentUser;
    } catch {
      const language = await getLanguageForCorrespondenceService().findById(LANGUAGE_ID[getLanguage(request) ?? 'en']);
      const languageId = language.unwrap().id;
      const currentUser = await getUserService().registerCurrentUser({ languageId }, context.session.authState.accessToken);
      context.session.currentUser = currentUser;
    }
  }

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.employee-dashboard') };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

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
        <PageTitle className="after:w-14">{t('app:hr-advisor-dashboard.page-title')}</PageTitle>
        <div className="grid gap-4">
          <ActionCard icon={faUser} title={t('app:hr-advisor-dashboard.all-employees')} />
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: IconProp;
  title: string;
}

function ActionCard({ icon, title }: ActionCardProps): JSX.Element {
  return (
    <AppLink file="routes/hr-advisor/employees.tsx">
      <Card asChild className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-6">
        <button type="submit" className="w-full text-left">
          <CardIcon icon={icon} />
          <CardHeader asChild className="p-0">
            <span>
              <CardTitle asChild className="flex items-center gap-2">
                <span role="heading" aria-level={2}>
                  {title}
                  <FontAwesomeIcon icon={faChevronRight} />
                </span>
              </CardTitle>
            </span>
          </CardHeader>
        </button>
      </Card>
    </AppLink>
  );
}
