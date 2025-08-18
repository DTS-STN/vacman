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
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { REQUIRE_OPTIONS } from '~/domain/constants';
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

  const profileService = getProfileService();
  const profileResult = await profileService.getProfileById(context.session.authState.accessToken, Number(params.profileId));

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profile = profileResult.unwrap();

  const formData = await request.formData();
  const parseResult = v.safeParse(referralPreferencesSchema, {
    languageReferralTypeIds: formData.getAll('languageReferralTypes'),
    classificationIds: formData.getAll('classifications'),
    workLocationProvince: formString(formData.get('workLocationProvince')),
    workLocationCitiesIds: formData.getAll('workLocationCities'),
    isAvailableForReferral: formData.get('referralAvailibility')
      ? formData.get('referralAvailibility') === REQUIRE_OPTIONS.yes
      : undefined,
    isInterestedInAlternation: formData.get('alternateOpportunity')
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

  const updateResult = await profileService.updateProfileById(context.session.authState.accessToken, {
    ...profile,
    languageReferralTypeIds: parseResult.output.languageReferralTypeIds,
    classificationIds: parseResult.output.classificationIds,
    workLocationProvince: parseResult.output.workLocationProvince,
    workLocationCitiesIds: parseResult.output.workLocationCitiesIds,
    isAvailableForReferral: parseResult.output.isAvailableForReferral,
    isInterestedInAlternation: parseResult.output.isInterestedInAlternation,
    employmentOpportunityIds: parseResult.output.employmentOpportunityIds,
  });

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { profileId: profileResult.unwrap().profileId.toString() },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const profileResult = await getProfileService().getProfileById(
    context.session.authState.accessToken,
    Number(params.profileId),
  );

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentOpportunities = await getEmploymentOpportunityTypeService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const profileData: Profile = profileResult.unwrap();

  const cityResult =
    profileData.workLocationCitiesIds?.[0] !== undefined
      ? await getCityService().findLocalizedById(profileData.workLocationCitiesIds[0], lang)
      : undefined; //get the province from first city only to avoid validation error on province
  const city = cityResult?.into();

  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      languageReferralTypeIds: profileData.languageReferralTypeIds,
      classificationIds: profileData.classificationIds,
      workLocationProvince: city?.provinceTerritory.id,
      workLocationCitiesIds: profileData.workLocationCitiesIds,
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
      employmentOpportunityIds: profileData.employmentOpportunityIds,
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
      <InlineLink className="mt-6 block" file="routes/hr-advisor/employee-profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <ReferralPreferencesForm
          cancelLink={'routes/hr-advisor/employee-profile/index.tsx'}
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
