/**
 * @fileoverview Employment Information Form Route
 * 
 * This file implements the employment information management form for employees.
 * It handles the collection and validation of employment-related data including:
 * - Substantive position and classification
 * - Organizational structure (branch, directorate)
 * - Work location (province, city)
 * - Work Force Adjustment (WFA) status and dates
 * - HR Advisor assignment
 * 
 * Key features:
 * - Form validation with complex WFA date logic
 * - Profile status management for approved profiles
 * - Dynamic field requirements based on WFA status
 * - Hierarchical organization data handling
 * - Automatic redirect after successful updates
 */

import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/employment-information';

import type { Profile } from '~/.server/domain/models';
import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { hasEmploymentDataChanged, omitObjectProperties } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { PROFILE_STATUS_CODE, PROFILE_STATUS_ID } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationForm } from '~/routes/page-components/employees/employment-information/form';
import type { EmploymentInformationSchema } from '~/routes/page-components/employees/validation.server';
import { parseEmploymentInformation } from '~/routes/page-components/employees/validation.server';

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
 * Action function for employment information form submission
 * 
 * Processes form data submission and handles complex business logic:
 * 1. Validates form data against employment information schema
 * 2. Updates the profile with new employment information
 * 3. Handles profile status changes for approved profiles
 * 4. Manages WFA date fields based on status selection
 * 
 * Special handling for approved profiles:
 * - If profile is currently approved and employment data changes,
 *   the profile status is reset to pending for re-approval
 * - Redirects with special parameter to show pending approval message
 * 
 * @param context - Route context containing session and authentication info
 * @param params - Route parameters for navigation
 * @param request - The incoming HTTP request with form data
 * @returns Validation errors or redirect response
 * @throws Will throw if profile update operations fail
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // Parse and validate form data
  const formData = await request.formData();
  const { parseResult, formValues } = await parseEmploymentInformation(formData, context.session.authState.accessToken);
  
  if (!parseResult.success) {
    return data(
      { formValues: formValues, errors: v.flatten<EmploymentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }
  
  // Get current profile for comparison and update
  const profileService = getProfileService();
  const currentProfileOption = await profileService.getCurrentUserProfile(context.session.authState.accessToken);
  const currentProfile = currentProfileOption.unwrap();
  
  // Update profile with new employment information
  // Remove temporary date fields used for form processing
  const updateResult = await profileService.updateProfileById(context.session.authState.accessToken, {
    ...currentProfile,
    employmentInformation: omitObjectProperties(parseResult.output, [
      'wfaEffectiveDateYear',
      'wfaEffectiveDateMonth', 
      'wfaEffectiveDateDay',
      'wfaEndDateYear',
      'wfaEndDateMonth',
      'wfaEndDateDay',
    ]),
  });
  
  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }
  
  // Handle profile status update for approved profiles
  if (
    currentProfile.profileStatus.id === PROFILE_STATUS_ID.approved &&
    hasEmploymentDataChanged(currentProfile.employmentInformation, parseResult.output)
  ) {
    // Profile needs re-approval when employment data changes on approved profile
    await profileService.updateProfileStatus(
      context.session.authState.accessToken,
      currentProfile.userId.toString(),
      PROFILE_STATUS_CODE.pending,
    );
    
    // Redirect with notification parameter
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentProfile.userId.toString() },
      search: new URLSearchParams({
        edited: 'true',
      }),
    });
  }
  
  // Standard redirect after successful update
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.userId.toString() },
  });
}

/**
 * Loader function for employment information form
 * 
 * Prepares all data needed for the employment information form:
 * 1. Validates authentication and privacy consent
 * 2. Fetches current profile data
 * 3. Loads all reference data (classifications, locations, etc.)
 * 4. Resolves hierarchical relationships (directorate -> branch)
 * 5. Prepares form default values from existing data
 * 
 * The loader handles complex relationship mapping:
 * - Directorate to parent branch resolution
 * - City to province territory mapping
 * - HR advisor user data fetching
 * 
 * @param context - Route context containing session and authentication info
 * @param request - The incoming HTTP request
 * @param params - Route parameters
 * @returns Form configuration data and reference lists
 * @throws Will throw if profile not found or data fetching fails
 */
export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const currentProfileOption = await getProfileService().getCurrentUserProfile(context.session.authState.accessToken);

  if (currentProfileOption.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const substantivePositions = await getClassificationService().listAllLocalized(lang);
  const branchOrServiceCanadaRegions = await getBranchService().listAllLocalized(lang);
  const directorates = await getDirectorateService().listAllLocalized(lang);
  const provinces = await getProvinceService().listAllLocalized(lang);
  const cities = await getCityService().listAllLocalized(lang);
  const wfaStatuses = await getWFAStatuses().listAllLocalized(lang);
  const hrAdvisorsResult = await getUserService().getUsersByRole('hr-advisor', context.session.authState.accessToken);

  if (hrAdvisorsResult.isErr()) {
    throw hrAdvisorsResult.unwrapErr();
  }

  const hrAdvisors = hrAdvisorsResult.unwrap();
  const profileData: Profile = currentProfileOption.unwrap();

  const workUnitResult =
    profileData.employmentInformation.directorate !== undefined &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang));
  const workUnit = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap() : undefined;
  const cityResult =
    profileData.employmentInformation.cityId !== undefined &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;

  return {
    documentTitle: t('app:employment-information.page-title'),
    defaultValues: {
      substantivePosition: profileData.employmentInformation.substantivePosition,
      branchOrServiceCanadaRegion: workUnit?.parent?.id ?? profileData.employmentInformation.branchOrServiceCanadaRegion,
      directorate: workUnit?.id,
      province: city?.provinceTerritory.id,
      cityId: profileData.employmentInformation.cityId,
      wfaStatus: profileData.employmentInformation.wfaStatus,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: profileData.employmentInformation.hrAdvisor,
    },
    substantivePositions: substantivePositions,
    branchOrServiceCanadaRegions: branchOrServiceCanadaRegions,
    directorates: directorates,
    provinces: provinces,
    cities: cities,
    wfaStatuses: wfaStatuses,
    hrAdvisors: hrAdvisors,
  };
}

/**
 * Employment Information Form Component
 * 
 * Renders the employment information form with comprehensive validation
 * and user experience features:
 * 
 * Features:
 * - Back navigation to profile overview
 * - Form validation with real-time error display
 * - Cancel functionality returning to profile
 * - Responsive layout with proper spacing
 * 
 * The form handles complex employment data including organizational
 * hierarchy, WFA status, and location information.
 * 
 * @param loaderData - Form configuration and reference data from loader
 * @param actionData - Form errors and validation results from action
 * @param params - Route parameters for navigation
 * @returns JSX element representing the employment information form
 */
export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
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
        <EmploymentInformationForm
          cancelLink={'routes/employee/profile/index.tsx'}
          formValues={loaderData.defaultValues}
          formErrors={errors}
          substantivePositions={loaderData.substantivePositions}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          provinces={loaderData.provinces}
          cities={loaderData.cities}
          wfaStatuses={loaderData.wfaStatuses}
          hrAdvisors={loaderData.hrAdvisors}
          params={params}
        />
      </div>
    </>
  );
}
