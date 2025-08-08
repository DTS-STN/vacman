import type { RouteHandle, LoaderFunctionArgs } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types';

import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.hiring-manager-dashboard') };
}

export default function HiringManagerDashboard() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.hiring-manager-dashboard')}</PageTitle>
      <p className="mt-4 text-lg text-slate-700">{t('app:index.about')}</p>
    </div>
  );
}
