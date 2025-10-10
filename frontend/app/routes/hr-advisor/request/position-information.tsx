import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/position-information';

import type { RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { mapRequestToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PositionInformationForm } from '~/routes/page-components/requests/position-information/form';
import type { PositionInformationSchema } from '~/routes/page-components/requests/validation.server';
import { createPositionInformationSchema } from '~/routes/page-components/requests/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const formData = await request.formData();
  const parseResult = v.safeParse(await createPositionInformationSchema(), {
    positionNumber: formString(formData.get('positionNumber')),
    groupAndLevel: formString(formData.get('groupAndLevel')),
    titleEn: formString(formData.get('titleEn')),
    titleFr: formString(formData.get('titleFr')),
    province: formString(formData.get('province')),
    cities: formData.getAll('cities'),
    languageRequirement: formString(formData.get('languageRequirement')),
    readingEn: formString(formData.get('readingEn')),
    readingFr: formString(formData.get('readingFr')),
    writingEn: formString(formData.get('writingEn')),
    writingFr: formString(formData.get('writingFr')),
    oralEn: formString(formData.get('oralEn')),
    oralFr: formString(formData.get('oralFr')),
    securityRequirement: formString(formData.get('securityRequirement')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<PositionInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const requestService = getRequestService();
  const requestResult = await requestService.getRequestById(Number(params.requestId), session.authState.accessToken);

  if (requestResult.isErr()) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestData: RequestReadModel = requestResult.unwrap();

  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  if (currentUser.id !== requestData.hrAdvisor?.id) {
    throw new Response('Cannot edit request', { status: HttpStatusCodes.BAD_REQUEST });
  }

  const requestPayload: RequestUpdateModel = mapRequestToUpdateModelWithOverrides(requestData, {
    positionNumbers: parseResult.output.positionNumber
      .split(',')
      .map((num) => num.trim())
      .join(','),
    classificationId: Number(parseResult.output.groupAndLevel),
    englishTitle: parseResult.output.titleEn,
    frenchTitle: parseResult.output.titleFr,
    cityIds: parseResult.output.cities.map((id) => ({ value: id })),
    languageRequirementId: Number(parseResult.output.languageRequirement),
    englishLanguageProfile: [parseResult.output.readingEn, parseResult.output.writingEn, parseResult.output.oralEn]
      .filter(Boolean)
      .join(''),
    frenchLanguageProfile: [parseResult.output.readingFr, parseResult.output.writingFr, parseResult.output.oralFr]
      .filter(Boolean)
      .join(''),
    securityClearanceId: Number(parseResult.output.securityRequirement),
  });

  const updateResult = await requestService.updateRequestById(requestData.id, requestPayload, session.authState.accessToken);

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hr-advisor/request/index.tsx', request, { params });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  if (currentUser.id !== requestData.hrAdvisor?.id) {
    throw new Response('Cannot edit request', { status: HttpStatusCodes.NOT_FOUND });
  }

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const localizedLanguageRequirements = await getLanguageRequirementService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const localizedSecurityClearances = await getSecurityClearanceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:position-information.page-title'),
    defaultValues: {
      positionNumber: requestData.positionNumber?.split(',').join(', '),
      classification: requestData.classification,
      englishTitle: requestData.englishTitle,
      frenchTitle: requestData.frenchTitle,
      englishLanguageProfile: requestData.englishLanguageProfile,
      frenchLanguageProfile: requestData.frenchLanguageProfile,
      languageRequirement: requestData.languageRequirement,
      securityClearance: requestData.securityClearance,
      cities: requestData.cities,
    },
    languageRequirements: localizedLanguageRequirements,
    classifications: localizedClassifications,
    provinces: localizedProvinces,
    cities: localizedCities,
    securityClearances: localizedSecurityClearances,
  };
}

export default function HiringManagerRequestPositionInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <BackLink
        aria-label={t('app:hiring-manager-requests.back')}
        className="mt-6"
        file="routes/hr-advisor/request/index.tsx"
        params={params}
      >
        {t('app:hiring-manager-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        <PositionInformationForm
          cancelLink="routes/hr-advisor/request/index.tsx"
          formErrors={actionData?.errors}
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
