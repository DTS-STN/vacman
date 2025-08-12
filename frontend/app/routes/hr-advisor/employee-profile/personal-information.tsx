import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from '../employee-profile/+types/personal-information';

import type { Profile } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PersonalInformationForm } from '~/routes/page-components/employees/personal-information/form';
import { toE164 } from '~/utils/phone-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getProfileById(
    context.session.authState.accessToken,
    Number(params.profileId),
  );

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  //TODO: Implement approval logic

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { id: profileResult.unwrap().profileId.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const accessToken = context.session.authState.accessToken;
  const currentUserOption = await getUserService().getCurrentUser(accessToken);
  const currentUser = currentUserOption.isSome() ? currentUserOption.unwrap() : undefined;
  const profileResult = await getProfileService().getProfileById(accessToken, Number(params.profileId));

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguagesOfCorrespondenceResult = await getLanguageForCorrespondenceService().listAllLocalized(lang);
  const profileData: Profile = profileResult.unwrap();

  return {
    documentTitle: t('app:personal-information.page-title'),
    defaultValues: {
      surname: profileData.personalInformation.surname,
      givenName: profileData.personalInformation.givenName,
      personalRecordIdentifier: profileData.personalInformation.personalRecordIdentifier,
      preferredLanguageId: profileData.personalInformation.preferredLanguageId,
      workEmail: currentUser?.businessEmail ?? profileData.personalInformation.workPhone,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: toE164(profileData.personalInformation.workPhone),
      personalPhone: toE164(profileData.personalInformation.personalPhone),
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    languagesOfCorrespondence: localizedLanguagesOfCorrespondenceResult,
  };
}

export default function PersonalInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/hr-advisor/employee-profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <PersonalInformationForm
          cancelLink={'routes/hr-advisor/employee-profile/index.tsx'}
          formValues={loaderData.defaultValues}
          isReadOnly={true}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
        />
      </div>
    </>
  );
}
