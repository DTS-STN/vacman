import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faMagnifyingGlass, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { hasUserProfile } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function action({ context, request }: Route.ActionArgs) {
  const authenticatedSession = context.session as AuthenticatedSession;

  const formData = await request.formData();
  const dashboard = formData.get('dashboard');

  if (dashboard === 'employee') {
    // Check if user is registered in the system
    const activeDirectoryId = authenticatedSession.authState.idTokenClaims.oid as string;
    const existingProfile = await hasUserProfile(activeDirectoryId);

    if (existingProfile) {
      // User has existing profile
      return i18nRedirect('routes/employee/index.tsx', request);
    } else {
      // User has no profile, redirect to privacy consent
      return i18nRedirect('routes/employee/privacy-consent.tsx', request);
    }
  }

  if (dashboard === 'hiring-manager') {
    // Check if user is registered in the system
    const userService = getUserService();
    const activeDirectoryId = authenticatedSession.authState.idTokenClaims.oid as string;
    const existingUser = await userService.getUserByActiveDirectoryId(activeDirectoryId);

    if (existingUser) {
      // User exists in the system
      if (existingUser.role.includes('hiring-manager')) {
        // User is already a hiring-manager, redirect to hiring-manager dashboard
        return i18nRedirect('routes/hiring-manager/index.tsx', request);
      } else {
        // User exists but is not a hiring-manager, update their role to hiring-manager
        await userService.updateUserRole(activeDirectoryId, 'hiring-manager', authenticatedSession);
        return i18nRedirect('routes/hiring-manager/index.tsx', request);
      }
    } else {
      // User is not registered, register them as hiring-manager and redirect
      await userService.registerUser(
        {
          activeDirectoryId,
          role: 'hiring-manager',
          // No privacy consent required for hiring managers
        },
        authenticatedSession,
      );

      return i18nRedirect('routes/hiring-manager/index.tsx', request);
    }
  }

  // Invalid dashboard selection
  return new Response('Invalid dashboard selection', { status: 400 });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // Check if this is a request to the root path without language
  const url = new URL(request.url);
  if (url.pathname === '/') {
    // Redirect to the appropriate language-specific route based on Accept-Language header
    return i18nRedirect('routes/index.tsx', request);
  }
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export default function Index() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.page-title')}</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard dashboard="employee" icon={faUserPlus} title={t('app:register.employee')} />
        <DashboardCard dashboard="hiring-manager" icon={faMagnifyingGlass} title={t('app:register.hiring-manager')} />
      </div>
    </div>
  );
}

interface DashboardCardProps {
  dashboard: 'employee' | 'hiring-manager';
  icon: IconProp;
  title: string;
}

function DashboardCard({ dashboard, icon, title }: DashboardCardProps): JSX.Element {
  return (
    <Form method="post">
      <input type="hidden" name="dashboard" value={dashboard} />
      <Card asChild className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50 sm:p-6">
        <button type="submit" className="w-full text-left">
          <CardIcon icon={icon} />
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2">
              <span>{title}</span>
              <FontAwesomeIcon icon={faChevronRight} />
            </CardTitle>
          </CardHeader>
        </button>
      </Card>
    </Form>
  );
}
