import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faMagnifyingGlass, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { Card, CardHeader, CardIcon, CardTitle } from '~/components/card';
import { AppLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('app:register.pageTitle') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export default function Index() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8">
      <PageTitle className="after:w-14">{t('app:register.pageTitle')}</PageTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <CardLink icon={faUserPlus} file="routes/register/privacy-consent.tsx" title={t('app:register.employee')} />
        <CardLink icon={faMagnifyingGlass} file="routes/index.tsx" title={t('app:register.hiringManager')} />
        {/* TODO: send POST request to register the user as hiring manager and redirect to hiring manager dashboard */}
      </div>
    </div>
  );
}

interface CardLinkProps {
  icon: IconProp;
  file: I18nRouteFile;
  title: string;
}

function CardLink({ icon, file, title }: CardLinkProps): JSX.Element {
  return (
    <Card asChild className="flex items-center gap-4 p-4 sm:p-6">
      <AppLink file={file}>
        <CardIcon icon={icon} />
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <span>{title}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </CardTitle>
        </CardHeader>
      </AppLink>
    </Card>
  );
}
