import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/employment-information';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { getHrAdvisors, hasEmploymentDataChanged, omitObjectProperties } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { PROFILE_STATUS_ID, PROFILE_STATUS_PENDING } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationForm } from '~/routes/page-components/employees/employment-information/form';
import type { EmploymentInformationSchema } from '~/routes/page-components/employees/validation.server';
import { parseEmploymentInformation } from '~/routes/page-components/employees/validation.server';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const formData = await request.formData();
  const { parseResult, formValues } = await parseEmploymentInformation(formData, context.session.authState.accessToken);
  if (!parseResult.success) {
    return data(
      { formValues: formValues, errors: v.flatten<EmploymentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }
  const profileService = getProfileService();
  const profileParams = { active: true };
  const currentProfile: Profile = await profileService.findCurrentUserProfile(
    profileParams,
    context.session.authState.accessToken,
  );

  const updateResult = await profileService.updateProfileById(
    currentProfile.id,
    omitObjectProperties(parseResult.output, [
      'wfaEffectiveDateYear',
      'wfaEffectiveDateMonth',
      'wfaEffectiveDateDay',
      'wfaEndDateYear',
      'wfaEndDateMonth',
      'wfaEndDateDay',
    ]),
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  if (
    currentProfile.profileStatus?.id === PROFILE_STATUS_ID.approved &&
    hasEmploymentDataChanged(currentProfile, parseResult.output)
  ) {
    // profile needs to be re-approved if and only if the current profile status is 'approved'
    await profileService.updateProfileStatus(
      currentProfile.profileUser.id,
      PROFILE_STATUS_PENDING,
      context.session.authState.accessToken,
    );
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentProfile.profileUser.id.toString() },
      search: new URLSearchParams({
        edited: 'true',
      }),
    });
  }
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.profileUser.id.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const profileParams = { active: true };
  const profileData = await getProfileService().findCurrentUserProfile(profileParams, context.session.authState.accessToken);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const substantivePositions = await getClassificationService().listAllLocalized(lang);
  const directorates = await getDirectorateService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const provinces = await getProvinceService().listAllLocalized(lang);
  const cities = await getCityService().listAllLocalized(lang);
  const wfaStatuses = await getWFAStatuses().listAllLocalized(lang);
  const hrAdvisors = await getHrAdvisors(context.session.authState.accessToken);

  const workUnitResult =
    profileData.substantiveWorkUnit !== undefined
      ? await getDirectorateService().findLocalizedById(profileData.substantiveWorkUnit?.id, lang)
      : undefined;
  const workUnit = workUnitResult?.into();

  return {
    documentTitle: t('app:employment-information.page-title'),
    defaultValues: {
      substantivePosition: profileData.substantiveClassification,
      branchOrServiceCanadaRegion: workUnit?.parent?.id,
      directorate: workUnit?.id,
      province: profileData.substantiveCity?.provinceTerritory,
      city: profileData.substantiveCity,
      wfaStatus: profileData.wfaStatus,
      wfaEffectiveDate: profileData.wfaStartDate,
      wfaEndDate: profileData.wfaEndDate,
      hrAdvisor: profileData.hrAdvisorId,
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
