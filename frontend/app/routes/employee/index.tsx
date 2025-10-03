import type { RouteHandle } from 'react-router';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { DashboardCard } from '~/components/dashboard-card';
import { PageTitle } from '~/components/page-title';
import { LANGUAGE_ID } from '~/domain/constants';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { getLanguage } from '~/utils/i18n-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
  layoutHasDecorativeBackground: true,
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const currentUser = await getUserService().getCurrentUser(session.authState.accessToken);
  if (currentUser.isNone()) {
    const language = await getLanguageForCorrespondenceService().findById(LANGUAGE_ID[getLanguage(request) ?? 'en']);
    await getUserService().registerCurrentUser({ languageId: language.unwrap().id }, session.authState.accessToken);
  }
  // create a profile if and only if there are no active profiles found for the current user
  const profileService = getProfileService();
  const profileResult = await profileService.getCurrentUserProfiles({ active: true }, session.authState.accessToken);
  if (profileResult.into()?.content.length === 0) {
    await profileService.registerProfile(session.authState.accessToken);
  }

  const { t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('app:employee-dashboard.page-title'),
  };
}

export default function EmployeeDashboard({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <PageTitle>{t('app:employee-dashboard.page-heading')}</PageTitle>
      <DashboardCard file="routes/employee/profile/index.tsx" icon={faUser} title={t('app:profile.view-profile')} />
    </>
  );
}
