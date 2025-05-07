import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/protected/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace, 'protected'],
} as const satisfies RouteHandle;

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['user']);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('protected:index.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function Index() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('protected:index.page-title')}</PageTitle>
      <h2 className="mt-10 mb-2 text-2xl font-bold text-slate-700">{t('protected:index.about')}</h2>
    </div>
  );
}
