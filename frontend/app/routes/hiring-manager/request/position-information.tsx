import type { RouteHandle } from 'react-router';

import type { Route } from './+types/position-information';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { BackLink } from '~/components/back-link';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PositionInformationForm } from '~/routes/page-components/employees/position-information/form';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const formData = await request.formData();
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  await requirePrivacyConsentForOwnProfile(context.session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const localizedLanguageRequirements = await getLanguageRequirementService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const localizedSecurityClearances = await getSecurityClearanceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:position-information.page-title'),
    defaultValues: {
      positionNumber: '',
      groupAndLevel: undefined,
      titleEn: '',
      titleFr: '',
      locationCity: undefined,
      languageRequirement: undefined,
      securityRequirement: undefined,
    },
    languageRequirements: localizedLanguageRequirements,
    classifications: localizedClassifications,
    provinces: localizedProvinces,
    cities: localizedCities,
    securityClearances: localizedSecurityClearances,
  };
}

export default function HiringManagerRequestPositionInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <>
      <BackLink className="mt-6" file="routes/hiring-manager/request/index.tsx" params={params} />
      <div className="max-w-prose">
        <PositionInformationForm
          cancelLink={'routes/hiring-manager/request/index.tsx'}
          formErrors={errors}
          formValues={loaderData.defaultValues}
          languageRequirements={loaderData.languageRequirements}
          classifications={loaderData.classifications}
          provinces={loaderData.provinces}
          cities={loaderData.cities}
          securityClearances={loaderData.securityClearances}
          params={params}
        />
      </div>
    </>
  );
}
