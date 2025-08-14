import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/referral-preferences';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { hasReferralDataChanged } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { PROFILE_STATUS_CODE, PROFILE_STATUS_ID, REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ReferralPreferencesForm } from '~/routes/page-components/employees/referral-preferences/form';
import { referralPreferencesSchema } from '~/routes/page-components/employees/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const formData = await request.formData();
  const parseResult = v.safeParse(referralPreferencesSchema, {
    languageReferralTypeIds: formData.getAll('languageReferralTypes'),
    classificationIds: formData.getAll('classifications'),
    workLocationProvince: formString(formData.get('workLocationProvince')),
    workLocationCitiesIds: formData.getAll('workLocationCities'),
    availableForReferralInd: formData.get('referralAvailibility')
      ? formData.get('referralAvailibility') === REQUIRE_OPTIONS.yes
      : undefined,
    interestedInAlternationInd: formData.get('alternateOpportunity')
      ? formData.get('alternateOpportunity') === REQUIRE_OPTIONS.yes
      : undefined,
    employmentOpportunityIds: formData.getAll('employmentOpportunityIds'),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof referralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

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
  if (
    currentProfile.profileStatus.id === PROFILE_STATUS_ID.approved &&
    hasReferralDataChanged(currentProfile.referralPreferences, parseResult.output)
  ) {
    // profile needs to be re-approved if and only if the current profile status is 'approved'
    await profileService.updateProfileStatus(
      context.session.authState.accessToken,
      currentProfile.userId.toString(),
      PROFILE_STATUS_CODE.pending,
    );
    return i18nRedirect('routes/employee/profile/index.tsx', request, {
      params: { id: currentProfile.userId.toString() },
      search: new URLSearchParams({
        edited: 'true',
      }),
    });
  }
  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentProfile.userId.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const currentProfileOption = await getProfileService().getCurrentUserProfile(context.session.authState.accessToken);

  if (currentProfileOption.isNone()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentOpportunities = await getEmploymentOpportunityTypeService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const profileData: Profile = currentProfileOption.unwrap();

  const cityResult =
    profileData.referralPreferences.workLocationCitiesIds?.[0] !== undefined &&
    (await getCityService().findLocalizedById(profileData.referralPreferences.workLocationCitiesIds[0], lang)); //get the province from first city only to avoid validation error on province
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
      employmentOpportunityIds: profileData.referralPreferences.employmentOpportunityIds,
    },
    languageReferralTypes: localizedLanguageReferralTypesResult,
    classifications: localizedClassifications,
    employmentOpportunities: localizedEmploymentOpportunities,
    provinces: localizedProvinces,
    cities: localizedCities,
  };
}

export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <ReferralPreferencesForm
          cancelLink={'routes/employee/profile/index.tsx'}
          formValues={loaderData.defaultValues}
          formErrors={errors}
          languageReferralTypes={loaderData.languageReferralTypes}
          classifications={loaderData.classifications}
          employmentOpportunities={loaderData.employmentOpportunities}
          provinces={loaderData.provinces}
          cities={loaderData.cities}
          params={params}
        />
      </div>
    </>
  );
}
