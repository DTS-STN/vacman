import type { LoaderFunctionArgs, MetaFunction, RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../+types/index';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { InlineLink } from '~/components/links';
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
  return { documentTitle: t('app:index.requests') };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.documentTitle }];
};

export default function RequestsDashboard({ params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/hr-advisor/index.tsx" params={params} id="back-button">
        {`< ${t('app:hr-advisor-dashboard.back')}`}
      </InlineLink>
      <div className="mb-8">
        <PageTitle className="after:w-14">{t('app:hr-advisor-dashboard.requests')}</PageTitle>
        <p className="mt-4 text-lg text-slate-700">{t('app:index.about')}</p>
      </div>
    </>
  );
}
