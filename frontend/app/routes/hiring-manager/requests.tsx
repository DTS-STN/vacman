import { Form, useNavigation } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/requests';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { Button } from '~/components/button';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export function action({ context, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:hiring-manager-requests.page-title') };
}

export default function HiringManagerRequests({ loaderData, params }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8 space-y-4">
      <PageTitle className="after:w-14">{t('app:hiring-manager-requests.page-title')}</PageTitle>

      <Form method="post" noValidate>
        <Button name="action" variant="primary" disabled={navigation.state !== 'idle'}>
          {t('app:hiring-manager-requests.create-request')}
        </Button>
      </Form>

      <h2 className="font-lato text-xl font-bold">{t('app:hiring-manager-requests.active-requests')}</h2>
      <div>{t('app:hiring-manager-requests.no-active-requests')}</div>

      <h2 className="font-lato text-xl font-bold">{t('app:hiring-manager-requests.archived-requests')}</h2>
      <div>{t('app:hiring-manager-requests.no-archived-requests')}</div>
    </div>
  );
}
