import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/referral-preferences';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { InlineLink } from '~/components/links';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ReferralPreferencesForm } from '~/routes/page-components/employees/referral-preferences/form';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const currentUserId = context.session.authState.idTokenClaims.oid;

  //TODO: Implement approval logic

  return i18nRedirect('routes/hr-advisor/employee-profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const currentProfileOption = await getProfileService().getProfileById(context.session.authState.accessToken, params.id);

  if (currentProfileOption.isErr()) {
    throw new Response('Profile not found', { status: 404 });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const profileData: Profile = currentProfileOption.unwrap();

  const cityResult =
    profileData.referralPreferences.workLocationCitiesIds?.[0] &&
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
      employmentTenureIds: profileData.referralPreferences.employmentTenureIds,
    },
    languageReferralTypes: localizedLanguageReferralTypesResult,
    classifications: localizedClassifications,
    employmentTenures: localizedEmploymentTenures,
    provinces: localizedProvinces,
    cities: localizedCities,
  };
}

export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/hr-advisor/employee-profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <ReferralPreferencesForm
          cancelLink={'routes/hr-advisor/employee-profile/index.tsx'}
          formValues={loaderData.defaultValues}
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
