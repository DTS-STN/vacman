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
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { hasEmploymentDataChanged, omitObjectProperties } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { PROFILE_STATUS_ID } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationForm } from '~/routes/page-components/employees/employment-information/form';
import type { employmentInformationSchema } from '~/routes/page-components/employees/validation.server';
import { parseEmploymentInformation } from '~/routes/page-components/employees/validation.server';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // Get the current user's ID from the authenticated session
  const authenticatedSession = context.session;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid;
  const formData = await request.formData();
  const { parseResult, formValues } = parseEmploymentInformation(formData);
  if (!parseResult.success) {
    return data(
      { formValues: formValues, errors: v.flatten<typeof employmentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }
  const profileService = getProfileService();
  const currentProfileOption = await profileService.getCurrentUserProfile(context.session.authState.accessToken);
  const currentProfile = currentProfileOption.unwrap();
  const updateResult = await profileService.updateProfile(
    authenticatedSession.authState.accessToken,
    currentProfile.profileId.toString(),
    currentUserId,
    {
      ...currentProfile,
      employmentInformation: omitObjectProperties(parseResult.output, [
        'wfaEffectiveDateYear',
        'wfaEffectiveDateMonth',
        'wfaEffectiveDateDay',
        'wfaEndDateYear',
        'wfaEndDateMonth',
        'wfaEndDateDay',
      ]),
    },
  );
  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }
  if (
    currentProfile.profileStatusId === PROFILE_STATUS_ID.approved &&
    hasEmploymentDataChanged(currentProfile.employmentInformation, parseResult.output)
  ) {
    // profile needs to be re-approved if and only if the current profile status is 'approved'
    await profileService.submitProfileForReview(currentUserId);
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentUserId },
      search: new URLSearchParams({
        edited: 'true',
      }),
    });
  }
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

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
  const authenticatedSession = context.session as AuthenticatedSession;
  const hrAdvisors = await getUserService().getUsersByRole('hr-advisor', authenticatedSession.authState.accessToken);
  const profileData: Profile = currentProfileOption.unwrap();

  const workUnitResult =
    profileData.employmentInformation.directorate &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang));
  const workUnit = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap() : undefined;
  const cityResult =
    profileData.employmentInformation.cityId &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;

  return {
    documentTitle: t('app:employment-information.page-title'),
    defaultValues: {
      substantivePosition: profileData.employmentInformation.substantivePosition,
      branchOrServiceCanadaRegion: workUnit?.parent?.id,
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

export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
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
