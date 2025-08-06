import type { JSX } from 'react';

import type { RouteHandle, LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { checkEmployeeRoutePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function action({ context, request }: ActionFunctionArgs) {
  const currentUrl = new URL(request.url);
  // Check privacy consent for employee routes (excluding privacy consent pages)

  await checkEmployeeRoutePrivacyConsent(context.session as AuthenticatedSession, currentUrl);

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'view-profile') {
    // Get the current user's ID from the authenticated session
    const authenticatedSession = context.session as AuthenticatedSession;
    const currentUserId = authenticatedSession.authState.idTokenClaims.oid as string;
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentUserId },
    });
  }

  // Invalid action
  return new Response('Invalid action', { status: 400 });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authenticatedSession = context.session as AuthenticatedSession;
  if (!authenticatedSession.currentUser) {
    try {
      const currentUser = await getUserService().getCurrentUser(authenticatedSession);
      authenticatedSession.currentUser = currentUser;
    } catch {
      // TODO registerCurrentUser '{user: CreateUser}' argument needs to be updated to match the backend
      const currentUser = await getUserService().registerCurrentUser({ role: 'employee' }, authenticatedSession);
      authenticatedSession.currentUser = currentUser;
    }
  }

  const currentUrl = new URL(request.url);

  // First ensure the user is authenticated (no specific roles required)
  requireAuthentication(context.session, currentUrl);

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
        <PageTitle className="after:w-14">{t('app:index.get-started')}</PageTitle>
        <div className="grid gap-4">
          <ActionCard action="view-profile" icon={faUser} title={t('app:profile.view')} />
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  action: string;
  icon: IconProp;
  title: string;
}

function ActionCard({ action, icon, title }: ActionCardProps): JSX.Element {
  return (
    <Form method="post">
      <input type="hidden" name="action" value={action} />
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
    </Form>
  );
}
