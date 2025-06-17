import type { JSX } from 'react';

import type { RouteHandle, LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from 'react-router';
import { Form } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function action({ context, request }: ActionFunctionArgs) {
  await requirePrivacyConsent(context.session, new URL(request.url));

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'view-profile') {
    return i18nRedirect('routes/employee/profile/index.tsx', request);
  }

  // Invalid action
  return new Response('Invalid action', { status: 400 });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  await requirePrivacyConsent(context.session, new URL(request.url));

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.get-started') };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function EmployeeDashboard() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.get-started')}</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard action="view-profile" icon={faUser} title={t('app:profile.view')} />
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
