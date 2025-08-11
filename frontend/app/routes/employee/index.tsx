import type { JSX } from 'react';

import type { RouteHandle, LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { getLanguage } from '~/utils/i18n-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, request }: ActionFunctionArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'view-profile') {
    const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentUser.id.toString() },
    });
  }

  // Invalid action
  return new Response('Invalid action', { status: 400 });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  requireAuthentication(context.session, request);

  if (!context.session.currentUser) {
    try {
      const currentUser = await getUserService().getCurrentUser(context.session.authState.accessToken);
      context.session.currentUser = currentUser;
    } catch {
      const lang = getLanguage(request);
      // TODO congifure the IDs or do a lookup with one of our services (provided our service returns the correct ID)
      // This assumes the IDs in the DB are autoincrementing starting at 1 (look at data.sql)
      const languageId = lang === 'en' ? 1 : 2;
      const currentUser = await getUserService().registerCurrentUser({ languageId }, context.session.authState.accessToken);
      context.session.currentUser = currentUser;
    } finally {
      await getProfileService().registerProfile(context.session.authState.accessToken);
    }
  }

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.employee-dashboard') };
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
