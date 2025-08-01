import type { RouteHandle, LoaderFunctionArgs, MetaFunction } from 'react-router';

import { useTranslation } from 'react-i18next';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const currentUrl = new URL(request.url);
  // Check if the user is authenticated (no specific roles required)
  requireAuthentication(context.session, currentUrl);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:index.hiring-manager-dashboard') };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function HiringManagerDashboard() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:index.hiring-manager-dashboard')}</PageTitle>
      <p className="mt-4 text-lg text-slate-700">{t('app:index.about')}</p>
    </div>
  );
}
