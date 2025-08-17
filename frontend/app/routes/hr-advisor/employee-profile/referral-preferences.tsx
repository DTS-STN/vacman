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
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const profileService = getProfileService();
  const profileResult = await profileService.getProfileById(Number(params.profileId), context.session.authState.accessToken);

  if (profileResult.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const profile = profileResult.unwrap();

  const formData = await request.formData();
  const parseResult = v.safeParse(referralPreferencesSchema, {
    preferredLanguages: formData.getAll('preferredLanguages'),
    preferredClassifications: formData.getAll('preferredClassifications'),
    preferredProvince: formString(formData.get('preferredProvince')),
    preferredCities: formData.getAll('preferredCities'),
    isAvailableForReferral: formData.get('isAvailableForReferral')
      ? formData.get('isAvailableForReferral') === REQUIRE_OPTIONS.yes
      : undefined,
    isInterestedInAlternation: formData.get('isInterestedInAlternation')
      ? formData.get('isInterestedInAlternation') === REQUIRE_OPTIONS.yes
      : undefined,
    preferredEmploymentOpportunities: formData.getAll('preferredEmploymentOpportunities'),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof referralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const updateResult = await profileService.updateProfileById(
    profile.id,
    {
      ...profile,
      preferredLanguages: parseResult.output.preferredLanguages,
      preferredClassifications: parseResult.output.preferredClassifications,
      preferredCities: parseResult.output.preferredCities,
      isAvailableForReferral: parseResult.output.isAvailableForReferral,
      isInterestedInAlternation: parseResult.output.isInterestedInAlternation,
      preferredEmploymentOpportunities: parseResult.output.preferredEmploymentOpportunities,
    },
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
    profileData.preferredCities?.[0] !== undefined
      ? await getCityService().findLocalizedById(profileData.preferredCities[0].id, lang)
      : undefined; //get the province from first city only to avoid validation error on province
  const city = cityResult?.into();

  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      preferredLanguages: profileData.preferredLanguages,
      preferredClassifications: profileData.preferredClassifications,
      preferredProvince: city?.provinceTerritory.id,
      preferredCities: profileData.preferredCities,
      isAvailableForReferral: profileData.isAvailableForReferral,
      isInterestedInAlternation: profileData.isInterestedInAlternation,
      preferredEmploymentOpportunities: profileData.preferredEmploymentOpportunities,
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
          preferredProvince={loaderData.defaultValues.preferredProvince}
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
