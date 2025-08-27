import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../employee-profile/+types/employment-information';

import type { Profile, ProfilePutModel } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { getHrAdvisors, mapProfileToPutModelWithOverrides } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
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

  const profileService = getProfileService();
  const profileResult = await profileService.getProfileById(Number(params.profileId), context.session.authState.accessToken);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const profile = profileResult.unwrap();

  const formData = await request.formData();
  const { parseResult, formValues } = await parseEmploymentInformation(formData, context.session.authState.accessToken);
  if (!parseResult.success) {
    return data(
      { formValues: formValues, errors: v.flatten<EmploymentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const profilePayload: ProfilePutModel = mapProfileToPutModelWithOverrides(profile, {
    classificationId: parseResult.output.substantiveClassification,
    workUnitId: parseResult.output.directorate,
    cityId: parseResult.output.cityId,
    wfaStatusId: parseResult.output.wfaStatusId,
    wfaStartDate: parseResult.output.wfaStartDate,
    wfaEndDate: parseResult.output.wfaEndDate,
    hrAdvisorId: parseResult.output.hrAdvisorId,
  });

  const updateResult = await profileService.updateProfileById(
    profile.id,
    profilePayload,
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { profileId: profileResult.unwrap().id.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getProfileById(
    Number(params.profileId),
    context.session.authState.accessToken,
  );

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const substantivePositions = await getClassificationService().listAllLocalized(lang);
  const directorates = await getDirectorateService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const provinces = await getProvinceService().listAllLocalized(lang);
  const cities = await getCityService().listAllLocalized(lang);
  const wfaStatuses = await getWFAStatuses().listAllLocalized(lang);

  const hrAdvisors = await getHrAdvisors(context.session.authState.accessToken);
  const profileData: Profile = profileResult.unwrap();

  return {
    documentTitle: t('app:employment-information.page-title'),
    defaultValues: {
      substantiveClassification: profileData.substantiveClassification,
      substantiveWorkUnit: profileData.substantiveWorkUnit,
      substantiveCity: profileData.substantiveCity,
      wfaStatus: profileData.wfaStatus,
      wfaStartDate: profileData.wfaStartDate,
      wfaEndDate: profileData.wfaEndDate,
      hrAdvisorId: profileData.hrAdvisorId,
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
      <BackLink aria-label={t('app:profile.back')} className="mt-6" file="routes/employee/profile/index.tsx" params={params}>
        {t('app:profile.back')}
      </BackLink>
      <div className="max-w-prose">
        <EmploymentInformationForm
          cancelLink={'routes/hr-advisor/employee-profile/index.tsx'}
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
