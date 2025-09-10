import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/personal-information';

import type { Profile, ProfilePutModel } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { mapProfileToPutModelWithOverrides } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PersonalInformationForm } from '~/routes/page-components/profile/personal-information/form';
import type { PersonalInformationSchema } from '~/routes/page-components/profile/validation.server';
import { createPersonalInformationSchema } from '~/routes/page-components/profile/validation.server';
import { toE164 } from '~/utils/phone-utils';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const formData = await request.formData();
  const parseResult = v.safeParse(await createPersonalInformationSchema(), {
    firstName: formString(formData.get('firstName')),
    lastName: formString(formData.get('lastName')),
    personalRecordIdentifier: formString(formData.get('personalRecordIdentifier')),
    languageOfCorrespondenceId: formString(formData.get('languageOfCorrespondenceId')),
    businessEmailAddress: formString(formData.get('businessEmailAddress')),
    personalEmailAddress: formString(formData.get('personalEmailAddress')),
    businessPhoneNumber: formString(formData.get('businessPhoneNumber')),
    personalPhoneNumber: formString(formData.get('personalPhoneNumber')),
    additionalComment: formString(formData.get('additionalComment')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<PersonalInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const profileService = getProfileService();
  const profileParams = { active: true };

  const currentProfile: Profile = await profileService.findCurrentUserProfile(
    profileParams,
    context.session.authState.accessToken,
  );

  // Get current user for complete user update
  const userService = getUserService();
  const currentUserOption = await userService.getCurrentUser(context.session.authState.accessToken);
  const currentUser = currentUserOption.into();

  // Extract fields for user update, remove it from profile data
  const {
    businessEmailAddress,
    businessPhoneNumber,
    firstName,
    lastName,
    personalRecordIdentifier,
    ...personalInformationForProfile
  } = parseResult.output;

  if (currentUser) {
    const userUpdateResult = await userService.updateUserById(
      // Send complete user object with updates
      currentUser.id,
      {
        ...currentUser,
        businessEmail: businessEmailAddress,
        businessPhone: businessPhoneNumber,
        firstName: firstName,
        lastName: lastName,
        personalRecordIdentifier: personalRecordIdentifier,
        languageId: currentUser.language.id,
      },
      context.session.authState.accessToken,
    );

    if (userUpdateResult.isErr()) {
      throw userUpdateResult.unwrapErr();
    }
  }

  // Update the profile (without fields for updating user)

  const profilePayload: ProfilePutModel = mapProfileToPutModelWithOverrides(currentProfile, {
    languageOfCorrespondenceId: personalInformationForProfile.languageOfCorrespondenceId,
    personalEmailAddress: personalInformationForProfile.personalEmailAddress,
    personalPhoneNumber: personalInformationForProfile.personalPhoneNumber,
    additionalComment: personalInformationForProfile.additionalComment,
  });

  const updateResult = await profileService.updateProfileById(
    currentProfile.id,
    profilePayload,
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.profileUser.id.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const accessToken = context.session.authState.accessToken;
  const currentUserOption = await getUserService().getCurrentUser(accessToken);
  const currentUser = currentUserOption.unwrap();
  const profileParams = { active: true };
  const profileData: Profile = await getProfileService().findCurrentUserProfile(profileParams, accessToken);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguagesOfCorrespondenceResult = await getLanguageForCorrespondenceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:personal-information.page-title'),
    defaultValues: {
      firstName: profileData.profileUser.firstName,
      lastName: profileData.profileUser.lastName,
      personalRecordIdentifier: profileData.profileUser.personalRecordIdentifier,
      languageOfCorrespondence: profileData.languageOfCorrespondence,
      businessEmailAddress: currentUser.businessEmailAddress ?? profileData.profileUser.businessEmailAddress,
      personalEmailAddress: profileData.personalEmailAddress,
      businessPhoneNumber: toE164(currentUser.businessPhoneNumber),
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
      <BackLink aria-label={t('app:profile.back')} className="mt-6" file="routes/employee/profile/index.tsx" params={params}>
        {t('app:profile.back')}
      </BackLink>
      <div className="max-w-prose">
        <PersonalInformationForm
          cancelLink="routes/employee/profile/index.tsx"
          formErrors={errors}
          formValues={loaderData.defaultValues}
          isReadOnly={false}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
        />
      </div>
    </>
  );
}
