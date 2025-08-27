import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import * as v from 'valibot';

import type { Route } from './+types/position-information';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { requirePrivacyConsentForOwnProfile } from '~/.server/utils/privacy-consent-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PositionInformationForm } from '~/routes/page-components/employees/position-information/form';
import { positionInformationSchema } from '~/routes/page-components/employees/validation.server';
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
  const parseResult = v.safeParse(positionInformationSchema, {
    positionNumber: formString(formData.get('positionNumber')),
    groupAndLevel: formString(formData.get('groupAndLevel')),
    titleEn: formString(formData.get('titleEn')),
    titleFr: formString(formData.get('titleFr')),
    province: formString(formData.get('province')),
    city: formString(formData.get('city')),
    languageRequirement: formString(formData.get('languageRequirement')),
    readingComprehensionEn: formString(formData.get('readingEn')),
    readingComprehensionFr: formString(formData.get('readingFr')),
    writtenExpressionEn: formString(formData.get('writingEn')),
    writtenExpressionFr: formString(formData.get('writingFr')),
    oralProficiencyEn: formString(formData.get('speakingEn')),
    oralProficiencyFr: formString(formData.get('speakingFr')),
    securityRequirement: formString(formData.get('securityRequirement')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof positionInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: call request service to update data

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request);
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

  //TODO: Call service method to fetch request data and populate form fields

  return {
    documentTitle: t('app:position-information.page-title'),
    defaultValues: {
      positionNumber: [],
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
      <BackLink
        className="mt-6"
        translationKey="app:hiring-manager-requests.back"
        file="routes/hiring-manager/request/index.tsx"
        params={params}
      />
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
