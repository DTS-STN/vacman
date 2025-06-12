import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faMagnifyingGlass, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { requireUnregisteredUser } from '~/.server/utils/user-registration-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function action({ context, request }: Route.ActionArgs) {
  // Ensure user is authenticated (no specific roles required)
  requireAuthentication(context.session, new URL(request.url));
  // Ensure user is unregistered
  requireUnregisteredUser(context.session, new URL(request.url));

  const formData = await request.formData();
  const role = formData.get('role');

  if (role === 'hiring-manager') {
    const userService = getUserService();
    const activeDirectoryId = context.session.authState.idTokenClaims.sub;
    // TODO: Do not allow a generic name to be submitted
    const name = context.session.authState.idTokenClaims.name ?? 'Unknown User';

    // Register the user as a hiring manager immediately
    await userService.registerUser(
      {
        name,
        activeDirectoryId,
        role,
      },
      context.session,
    );
    return i18nRedirect('routes/index.tsx', request);
  }

  // For employee role, redirect to privacy consent page WITHOUT registering yet
  if (role === 'employee') {
    return i18nRedirect('routes/register/privacy-consent.tsx', request);
  }

  // Invalid role
  return new Response('Invalid role selection', { status: 400 });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, new URL(request.url));
  requireUnregisteredUser(context.session, new URL(request.url));
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:register.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export default function Index() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:register.page-title')}</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard userRole="employee" icon={faUserPlus} title={t('app:register.employee')} />
        <RoleCard userRole="hiring-manager" icon={faMagnifyingGlass} title={t('app:register.hiring-manager')} />
      </div>
    </div>
  );
}

interface RoleCardProps {
  userRole: 'employee' | 'hiring-manager';
  icon: IconProp;
  title: string;
}

function RoleCard({ userRole, icon, title }: RoleCardProps): JSX.Element {
  return (
    <Form method="post">
      <input type="hidden" name="role" value={userRole} />
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
