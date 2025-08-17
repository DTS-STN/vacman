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
import { pickObjectProperties } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { PROFILE_STATUS_ID, PROFILE_STATUS_PENDING, REQUIRE_OPTIONS } from '~/domain/constants';
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

  const allReferralKeys: (keyof Profile)[] = [
    'preferredLanguages',
    'preferredClassifications',
    'preferredCities',
    'isAvailableForReferral',
    'isInterestedInAlternation',
    'preferredEmploymentOpportunities',
  ];

  const profileService = getProfileService();
  const profileParams = { active: true };
  const currentProfile = await profileService.findCurrentUserProfile(profileParams, context.session.authState.accessToken);

  const oldReferralData = pickObjectProperties(currentProfile, allReferralKeys);
  const newReferralData = pickObjectProperties(
    {
      ...currentProfile,
      preferredLanguages: parseResult.output.preferredLanguages,
      preferredClassifications: parseResult.output.preferredClassifications,
      preferredCities: parseResult.output.preferredCities,
      isAvailableForReferral: parseResult.output.isAvailableForReferral,
      isInterestedInAlternation: parseResult.output.isInterestedInAlternation,
      preferredEmploymentOpportunities: parseResult.output.preferredEmploymentOpportunities,
    },
    allReferralKeys,
  );

  const updateResult = await profileService.updateProfileById(
    currentProfile.id,
    newReferralData,
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  if (
    currentProfile.profileStatus?.id === PROFILE_STATUS_ID.approved &&
    hasReferralDataChanged(oldReferralData, newReferralData)
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
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentOpportunities = await getEmploymentOpportunityTypeService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);

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
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <ReferralPreferencesForm
          cancelLink={'routes/employee/profile/index.tsx'}
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
