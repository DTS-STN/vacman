import type { RouteHandle } from 'react-router';
import { data, useNavigation } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/employment-information';

import type { Profile, ProfilePutModel } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { getHrAdvisors, hasEmploymentDataChanged, mapProfileToPutModelWithOverrides } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { withSpan } from '~/.server/utils/telemetry-utils';
import { BackLink } from '~/components/back-link';
import { PROFILE_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { EmploymentInformationForm } from '~/routes/page-components/profile/employment-information-form';
import type { EmploymentInformationSchema } from '~/routes/page-components/profile/validation.server';
import { parseEmploymentInformation } from '~/routes/page-components/profile/validation.server';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  return withSpan('employee.profile.employment-information.action', async () => {
    const { session } = context.get(context.applicationContext);
    requireAuthentication(session, request);

    const hrAdvisors = await getHrAdvisors(session.authState.accessToken);
    const formData = await request.formData();
    const { parseResult, formValues } = await parseEmploymentInformation(formData, hrAdvisors);
    if (!parseResult.success) {
      return data(
        { formValues: formValues, errors: v.flatten<EmploymentInformationSchema>(parseResult.issues).nested },
        { status: HttpStatusCodes.BAD_REQUEST },
      );
    }
    const profileService = getProfileService();
    const profileParams = { active: true };
    const currentProfile: Profile = await profileService.findCurrentUserProfile(profileParams, session.authState.accessToken);

    const profilePayload: ProfilePutModel = mapProfileToPutModelWithOverrides(currentProfile, {
      classificationId: parseResult.output.substantiveClassification,
      workUnitId: parseResult.output.directorate
        ? Number(parseResult.output.directorate)
        : parseResult.output.branchOrServiceCanadaRegion
          ? Number(parseResult.output.branchOrServiceCanadaRegion)
          : undefined,
      cityId: parseResult.output.cityId,
      wfaStatusId: parseResult.output.wfaStatusId,
      wfaStartDate: parseResult.output.wfaStartDate,
      wfaEndDate: parseResult.output.wfaEndDate,
      hrAdvisorId: parseResult.output.hrAdvisorId,
    });

    const updateResult = await profileService.updateProfileById(
      currentProfile.id,
      profilePayload,
      session.authState.accessToken,
    );

    if (updateResult.isErr()) {
      throw updateResult.unwrapErr();
    }

    if (
      currentProfile.profileStatus?.code === PROFILE_STATUS.APPROVED.code &&
      hasEmploymentDataChanged(currentProfile, parseResult.output)
    ) {
      // profile needs to be re-approved if and only if the current profile status is 'approved'
      await profileService.updateProfileStatus(currentProfile.id, PROFILE_STATUS.PENDING, session.authState.accessToken);
      return i18nRedirect('routes/employee/profile/index.tsx', request, {
        params: { id: currentProfile.profileUser.id.toString() },
        search: new URLSearchParams({
          editedEmp: 'true',
        }),
      });
    }
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentProfile.profileUser.id.toString() },
      search: new URLSearchParams({ success: 'employment' }),
    });
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  return withSpan('employee.profile.employment-information.loader', async () => {
    const { session } = context.get(context.applicationContext);
    requireAuthentication(session, request);
    await requirePrivacyConsentForOwnProfile(session, request);

    const profileParams = { active: true };
    const profileData = await getProfileService().findCurrentUserProfile(profileParams, session.authState.accessToken);

    const { lang, t } = await getTranslation(request, handle.i18nNamespace);

    const [allWorkUnits, substantivePositions, provinces, cities, wfaStatuses, hrAdvisors] = await Promise.all([
      getWorkUnitService().listAllLocalized(lang),
      getClassificationService().listAllLocalized(lang),
      getProvinceService().listAllLocalized(lang),
      getCityService().listAllLocalized(lang),
      getWFAStatuses().listAllLocalized(lang),
      getHrAdvisors(session.authState.accessToken),
    ]);

    const directorates = allWorkUnits.filter((wu) => wu.parent !== null);
    // Extract all unique branches (both standalone and those with directorates)
    const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(allWorkUnits);

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
      substantivePositions,
      branchOrServiceCanadaRegions,
      directorates,
      provinces,
      cities,
      wfaStatuses,
      hrAdvisors,
    };
  });
}

export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      <BackLink aria-label={t('app:profile.back')} className="mt-6" file="routes/employee/profile/index.tsx" params={params}>
        {t('app:profile.back')}
      </BackLink>
      <div className="max-w-prose">
        <EmploymentInformationForm
          cancelLink="routes/employee/profile/index.tsx"
          formValues={loaderData.defaultValues}
          formErrors={actionData?.errors}
          substantivePositions={loaderData.substantivePositions}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          provinces={loaderData.provinces}
          cities={loaderData.cities}
          wfaStatuses={loaderData.wfaStatuses}
          hrAdvisors={loaderData.hrAdvisors}
          params={params}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
