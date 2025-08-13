/**
 * @fileoverview Referral Preferences Form Route
 * 
 * This file implements the referral preferences management form for employees.
 * It handles the collection and validation of job referral preferences including:
 * - Language referral types and requirements
 * - Classification preferences
 * - Work location preferences (province and cities)
 * - Referral availability status
 * - Interest in alternation opportunities
 * - Employment tenure preferences
 * 
 * Key features:
 * - Multi-select form fields with validation
 * - Hierarchical location data (province → cities)
 * - Boolean preference handling (yes/no options)
 * - Form validation with comprehensive error handling
 * - Automatic redirect after successful updates
 */

import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/referral-preferences';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ReferralPreferencesForm } from '~/routes/page-components/employees/referral-preferences/form';
import { referralPreferencesSchema } from '~/routes/page-components/employees/validation.server';
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
 * Action function for referral preferences form submission
 * 
 * Processes form data for referral preferences with complex multi-select handling:
 * 1. Validates form data against referral preferences schema
 * 2. Converts yes/no string values to boolean for availability flags
 * 3. Handles multiple selection arrays for various preference categories
 * 4. Updates the profile with new referral preferences
 * 
 * Form data processing:
 * - Multi-select fields (language types, classifications, cities, tenures) → Arrays
 * - Yes/No radio buttons → Boolean values
 * - Province selection → Used for city filtering (not stored directly)
 * 
 * @param context - Route context containing session and authentication info
 * @param params - Route parameters for navigation
 * @param request - The incoming HTTP request with form data
 * @returns Validation errors or redirect response
 * @throws Will throw if profile update operations fail
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // Parse and validate form data with complex field handling
  const formData = await request.formData();
  const parseResult = v.safeParse(referralPreferencesSchema, {
    languageReferralTypeIds: formData.getAll('languageReferralTypes'),  // Multi-select array
    classificationIds: formData.getAll('classifications'),              // Multi-select array
    workLocationProvince: formString(formData.get('workLocationProvince')), // Used for city filtering
    workLocationCitiesIds: formData.getAll('workLocationCities'),       // Multi-select array
    // Convert yes/no string values to boolean
    availableForReferralInd: formData.get('referralAvailibility')
      ? formData.get('referralAvailibility') === REQUIRE_OPTIONS.yes
      : undefined,
    interestedInAlternationInd: formData.get('alternateOpportunity')
      ? formData.get('alternateOpportunity') === REQUIRE_OPTIONS.yes
      : undefined,
    employmentTenureIds: formData.getAll('employmentTenures'),          // Multi-select array
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof referralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  // Update profile with referral preferences
  const profileService = getProfileService();
  const currentProfileOption = await profileService.getCurrentUserProfile(context.session.authState.accessToken);
  const currentProfile = currentProfileOption.unwrap();
  const updateResult = await profileService.updateProfileById(context.session.authState.accessToken, {
    ...currentProfile,
    referralPreferences: parseResult.output,
  });

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  // Redirect back to profile overview
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.userId.toString() },
  });
}

/**
 * Loader function for referral preferences form
 * 
 * Prepares comprehensive reference data for the referral preferences form:
 * 1. Validates authentication and privacy consent
 * 2. Fetches current profile data
 * 3. Loads all reference data lists in localized format
 * 4. Resolves city-to-province relationships for form initialization
 * 5. Prepares form default values from existing preferences
 * 
 * Reference data includes:
 * - Language referral types (bilingual requirements, etc.)
 * - Job classifications (EX, AS, PM, etc.)
 * - Employment tenures (permanent, term, casual, etc.)
 * - Provinces and cities for location preferences
 * 
 * Special handling for province initialization:
 * - Uses the first selected city to determine the province for form display
 * - Prevents validation errors when cities from multiple provinces are selected
 * 
 * @param context - Route context containing session and authentication info
 * @param request - The incoming HTTP request
 * @param params - Route parameters
 * @returns Form default values and comprehensive reference data
 * @throws Will throw if profile not found or data fetching fails
 */
export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  // Get current profile data
  const currentProfileOption = await getProfileService().getCurrentUserProfile(context.session.authState.accessToken);

  if (currentProfileOption.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  // Fetch all reference data in localized format
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const profileData: Profile = currentProfileOption.unwrap();

  // Resolve province from first selected city for form initialization
  // This prevents validation errors when multiple cities are selected
  const cityResult =
    profileData.referralPreferences.workLocationCitiesIds?.[0] !== undefined &&
    (await getCityService().findLocalizedById(profileData.referralPreferences.workLocationCitiesIds[0], lang));
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;

  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      languageReferralTypeIds: profileData.referralPreferences.languageReferralTypeIds,
      classificationIds: profileData.referralPreferences.classificationIds,
      workLocationProvince: city?.provinceTerritory.id,
      workLocationCitiesIds: profileData.referralPreferences.workLocationCitiesIds,
      availableForReferralInd: profileData.referralPreferences.availableForReferralInd,
      interestedInAlternationInd: profileData.referralPreferences.interestedInAlternationInd,
      employmentTenureIds: profileData.referralPreferences.employmentTenureIds,
    },
    languageReferralTypes: localizedLanguageReferralTypesResult,
    classifications: localizedClassifications,
    employmentTenures: localizedEmploymentTenures,
    provinces: localizedProvinces,
    cities: localizedCities,
  };
}

/**
 * Referral Preferences Form Component
 * 
 * Renders the referral preferences form with comprehensive multi-select
 * functionality and user experience features:
 * 
 * Features:
 * - Back navigation to profile overview
 * - Multiple selection fields for various preference categories
 * - Form validation with real-time error display
 * - Province-city cascading selection
 * - Yes/No radio button handling for availability preferences
 * - Cancel functionality returning to profile
 * 
 * The form manages complex preference data that helps determine
 * what types of job opportunities should be offered to the employee.
 * 
 * @param loaderData - Form configuration and reference data from loader
 * @param actionData - Form errors and validation results from action
 * @param params - Route parameters for navigation
 * @returns JSX element representing the referral preferences form
 */
export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
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
        <ReferralPreferencesForm
          cancelLink={'routes/employee/profile/index.tsx'}
          formValues={loaderData.defaultValues}
          formErrors={errors}
          languageReferralTypes={loaderData.languageReferralTypes}
          classifications={loaderData.classifications}
          employmentTenures={loaderData.employmentTenures}
          provinces={loaderData.provinces}
          cities={loaderData.cities}
          params={params}
        />
      </div>
    </>
  );
}
