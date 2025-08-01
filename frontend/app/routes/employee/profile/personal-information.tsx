import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/personal-information';

import type { Profile } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PersonalInformationForm } from '~/routes/page-components/employees/personal-information/form';
import { personalInformationSchema } from '~/routes/page-components/employees/validation.server';
import { toE164 } from '~/utils/phone-utils';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  // Get the current user's ID from the authenticated session
  const authenticatedSession = context.session as AuthenticatedSession;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid as string;
  const formData = await request.formData();
  const parseResult = v.safeParse(personalInformationSchema, {
    surname: formString(formData.get('surname')),
    givenName: formString(formData.get('givenName')),
    personalRecordIdentifier: formString(formData.get('personalRecordIdentifier')),
    preferredLanguageId: formString(formData.get('preferredLanguageId')),
    workEmail: formString(formData.get('workEmail')),
    personalEmail: formString(formData.get('personalEmail')),
    workPhone: formString(formData.get('workPhone')),
    personalPhone: formString(formData.get('personalPhone')),
    additionalInformation: formString(formData.get('additionalInformation')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof personalInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const updateResult = await getProfileService().updatePersonalInformation(currentUserId, parseResult.output);

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  // Use the id parameter from the URL to fetch the profile
  const profileUserId = params.id;
  const profileUser = await getUserService().getUserByActiveDirectoryId(profileUserId);
  const profileResult = await getProfileService().getProfile(profileUserId);

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
      workEmail: profileUser?.businessEmail ?? profileData.personalInformation.workPhone,
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
  const errors = actionData?.errors;

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <PersonalInformationForm
          cancelLink={'routes/employee/profile/index.tsx'}
          formErrors={errors}
          formValues={loaderData.defaultValues}
          isReadOnly={false}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          param={params}
        />
      </div>
    </>
  );
}
