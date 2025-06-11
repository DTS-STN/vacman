import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { ButtonLink } from '~/components/button-link';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

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
      <h2 className="mt-10 mb-2 text-2xl font-bold text-slate-700">{t('app:index.about')}</h2>
      <ButtonLink className="mt-3" file="routes/profile/index.tsx">
        Create/View Profile
      </ButtonLink>
    </div>
  );
}
