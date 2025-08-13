/**
 * @fileoverview Personal Information Form Route
 * 
 * This file implements the personal information management form for employees.
 * It handles the collection and validation of personal data including:
 * - Name information (surname, given name)
 * - Personal Record Identifier (PRI)
 * - Language preferences
 * - Contact information (work/personal email and phone)
 * - Additional information
 * 
 * Key features:
 * - Dual user/profile data handling (work phone stored in user, other data in profile)
 * - Form validation with comprehensive error handling
 * - Phone number formatting and validation
 * - Language preference management
 * - Automatic redirect after successful updates
 */

import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/personal-information';

import type { Profile } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PersonalInformationForm } from '~/routes/page-components/employees/personal-information/form';
import { personalInformationSchema } from '~/routes/page-components/employees/validation.server';
import { toE164 } from '~/utils/phone-utils';
import { formString } from '~/utils/string-utils';

/**
 * Route configuration for internationalization
 * Inherits translation namespaces from parent layout
 */
export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

/**
 * Meta function to set the page title
 * @param loaderData - Data from the loader function containing document title
 * @returns Array of meta tags for the page
 */
export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

/**
 * Action function for personal information form submission
 * 
 * Handles the complex dual-update pattern for personal information:
 * 1. Validates form data against personal information schema
 * 2. Separates work phone (goes to user record) from other data (goes to profile)
 * 3. Updates profile with personal information
 * 4. Updates user record with work phone and language preference
 * 
 * Data separation logic:
 * - Work phone and language preference → User record
 * - All other personal information → Profile record
 * 
 * This pattern ensures data consistency across the user and profile entities
 * while maintaining proper data relationships.
 * 
 * @param context - Route context containing session and authentication info
 * @param params - Route parameters for navigation
 * @param request - The incoming HTTP request with form data
 * @returns Validation errors or redirect response
 * @throws Will throw if profile or user update operations fail
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // Parse and validate form data
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

  // Get current profile and user data
  const profileService = getProfileService();
  const currentProfileOption = await profileService.getCurrentUserProfile(context.session.authState.accessToken);
  const currentProfile = currentProfileOption.unwrap();

  const userService = getUserService();
  const currentUserOption = await userService.getCurrentUser(context.session.authState.accessToken);
  const currentUser = currentUserOption.isSome() ? currentUserOption.unwrap() : undefined;

  // Separate work phone from profile data (work phone goes to user record)
  const { workPhone, ...personalInformationForProfile } = parseResult.output;

  // Update profile with personal information (excluding work phone)
  const updateResult = await profileService.updateProfileById(context.session.authState.accessToken, {
    ...currentProfile,
    personalInformation: personalInformationForProfile,
  });

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  // Update user record with work phone and language preference
  if (workPhone && currentUser) {
    const userUpdateResult = await userService.updateUser(
      {
        ...currentUser,
        languageId: parseResult.output.preferredLanguageId,
        businessPhone: workPhone,
      },
      context.session.authState.accessToken,
    );

    if (userUpdateResult.isErr()) {
      throw userUpdateResult.unwrapErr();
    }
  }

  // Redirect back to profile overview
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.userId.toString() },
  });
}

/**
 * Loader function for personal information form
 * 
 * Prepares form data by merging information from both user and profile records:
 * 1. Validates authentication and privacy consent
 * 2. Fetches current user and profile data
 * 3. Loads language options for the form
 * 4. Merges data with proper precedence (user data overrides profile where applicable)
 * 5. Formats phone numbers for display
 * 
 * Data merging strategy:
 * - Work email: User business email takes precedence over profile work email
 * - Work phone: Always from user record (businessPhone field)
 * - Other fields: From profile record
 * 
 * @param context - Route context containing session and authentication info
 * @param request - The incoming HTTP request
 * @param params - Route parameters
 * @returns Form default values and language options
 * @throws Will throw if profile not found or data fetching fails
 */
export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const accessToken = context.session.authState.accessToken;
  const currentUserOption = await getUserService().getCurrentUser(accessToken);
  const currentUser = currentUserOption.isSome() ? currentUserOption.unwrap() : undefined;
  const profileResult = await getProfileService().getCurrentUserProfile(accessToken);

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
      workEmail: currentUser?.businessEmail ?? profileData.personalInformation.workEmail,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: toE164(currentUser?.businessPhone),
      personalPhone: toE164(profileData.personalInformation.personalPhone),
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    languagesOfCorrespondence: localizedLanguagesOfCorrespondenceResult,
  };
}

/**
 * Personal Information Form Component
 * 
 * Renders the personal information form with comprehensive validation
 * and user experience features:
 * 
 * Features:
 * - Back navigation to profile overview
 * - Form validation with real-time error display
 * - Language selection with localized options
 * - Phone number formatting
 * - Cancel functionality returning to profile
 * - Read-only mode support (currently disabled)
 * 
 * The form handles the complex user/profile data relationship,
 * ensuring data is properly separated and stored in the correct entities.
 * 
 * @param loaderData - Form configuration and default values from loader
 * @param actionData - Form errors and validation results from action
 * @param params - Route parameters for navigation
 * @returns JSX element representing the personal information form
 */
export default function PersonalInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  return (
    <>
      {/* Back navigation link */}
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      
      {/* Form container with responsive width */}
      <div className="max-w-prose">
        <PersonalInformationForm
          cancelLink={'routes/employee/profile/index.tsx'}
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
