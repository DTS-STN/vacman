import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../employee-profile/+types/personal-information';

import type { Profile } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
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

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileService = getProfileService();
  const profileResult = await profileService.getProfileById(Number(params.profileId), context.session.authState.accessToken);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profile = profileResult.unwrap();

  const formData = await request.formData();
  const parseResult = v.safeParse(personalInformationSchema, {
    firstName: formString(formData.get('firstName')),
    lastName: formString(formData.get('lastName')),
    personalRecordIdentifier: formString(formData.get('personalRecordIdentifier')),
    preferredLanguageId: formString(formData.get('preferredLanguageId')),
    businessEmailAddress: formString(formData.get('businessEmailAddress')),
    personalEmailAddress: formString(formData.get('personalEmailAddress')),
    businessPhoneNumber: formString(formData.get('businessPhoneNumber')),
    personalPhoneNumber: formString(formData.get('personalPhoneNumber')),
    additionalComment: formString(formData.get('additionalComment')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof personalInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  // Extract workPhone for user update, remove it from profile data
  const { businessPhoneNumber, ...personalInformationForProfile } = parseResult.output;

  const updateProfileResult = await profileService.updateProfileById(
    profile.id,
    personalInformationForProfile,
    context.session.authState.accessToken,
  );

  if (updateProfileResult.isErr()) {
    throw updateProfileResult.unwrapErr();
  }

  const userService = getUserService();
  const userResult = await userService.getUserById(profile.profileUser.id, context.session.authState.accessToken);

  if (userResult.isErr()) {
    throw new Response('User not found', { status: 404 });
  }

  const user = userResult.unwrap();

  const userUpdateResult = await userService.updateUserById(
    // Send complete user object with updates
    user.id,
    {
      ...user,
      languageId: parseResult.output.preferredLanguageId,
      businessPhoneNumber: businessPhoneNumber,
    },
    context.session.authState.accessToken,
  );

  if (userUpdateResult.isErr()) {
    throw userUpdateResult.unwrapErr();
  }

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { profileId: profileResult.unwrap().id.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const accessToken = context.session.authState.accessToken;
  const currentUserOption = await getUserService().getCurrentUser(accessToken);
  const currentUser = currentUserOption.unwrap();
  const profileResult = await getProfileService().getProfileById(Number(params.profileId), accessToken);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguagesOfCorrespondenceResult = await getLanguageForCorrespondenceService().listAllLocalized(lang);
  const profileData: Profile = profileResult.unwrap();

  return {
    documentTitle: t('app:personal-information.page-title'),
    defaultValues: {
      firstName: profileData.profileUser.firstName,
      lastName: profileData.profileUser.lastName,
      personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier,
      preferredLanguageId: profileData.languageOfCorrespondence,
      businessEmailAddress: currentUser.businessEmailAddress ?? profileData.profileUser.businessEmailAddress,
      personalEmailAddress: profileData.personalEmailAddress,
      businessPhoneNumber: toE164(currentUser.businessPhoneNumber ?? profileData.profileUser.businessPhoneNumber),
      personalPhoneNumber: toE164(profileData.personalPhoneNumber),
      additionalComment: profileData.additionalComment,
    },
    languagesOfCorrespondence: localizedLanguagesOfCorrespondenceResult,
  };
}

export default function PersonalInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/hr-advisor/employee-profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <PersonalInformationForm
          cancelLink={'routes/hr-advisor/employee-profile/index.tsx'}
          formValues={loaderData.defaultValues}
          formErrors={errors}
          isReadOnly={true}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
        />
      </div>
    </>
  );
}
