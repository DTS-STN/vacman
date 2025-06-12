import { useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/employment-information';

import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { employmentInformationSchema } from '~/routes/profile/validation.server';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const formData = await request.formData();
  const parseResult = v.safeParse(employmentInformationSchema, {
    substantivePosition: formString(formData.get('substantivePosition')),
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    province: formString(formData.get('province')),
    city: formString(formData.get('city')),
    currentWFAStatus: formString(formData.get('currentWFAStatus')),
    hrAdvisor: formString(formData.get('hrAdvisor')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof employmentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data after validation

  throw i18nRedirect('routes/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const substantivePositions = await getClassificationService().getAll();
  const branchOrServiceCanadaRegions = await getBranchService().getAllLocalized(lang);
  const directorates = await getDirectorateService().getLocalizedDirectorates(lang);
  const provinces = await getProvinceService().getAllLocalized(lang);
  const cities = await getCityService().getAllLocalized(lang);

  return {
    documentTitle: t('app:employmeny-information.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      substantivePosition: undefined as string | undefined,
      branchOrServiceCanadaRegion: undefined as string | undefined,
      directorate: undefined as string | undefined,
      province: undefined as string | undefined,
      city: undefined as string | undefined,
      currentWFAStatus: undefined as string | undefined,
      hrAdvisor: undefined,
    },
    substantivePositions: substantivePositions.unwrap(),
    branchOrServiceCanadaRegions: branchOrServiceCanadaRegions.unwrap(),
    directorates: directorates,
    provinces: provinces.unwrap(),
    cities: cities.unwrap(),
  };
}

export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;
  const [province, setProvince] = useState(loaderData.defaultValues.province);

  const substantivePositionOptions = [{ id: 'select-option', name: '' }, ...loaderData.substantivePositions].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : id,
      children: id === 'select-option' ? t('app:form.select-option') : name,
    }),
  );

  const branchOrServiceCanadaRegionOptions = [
    { id: 'select-option', name: '' },
    ...loaderData.branchOrServiceCanadaRegions,
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const directorateOptions = [{ id: 'select-option', name: '' }, ...loaderData.directorates].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const provinceOptions = [{ id: 'select-option', name: '' }, ...loaderData.provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const cityOptions = [{ id: 'select-option', name: '' }, ...loaderData.cities.filter((c) => c.province.id === province)].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : id,
      children: id === 'select-option' ? t('app:form.select-option') : name,
    }),
  );

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/profile/index.tsx" id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:employmeny-information.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <h2 className="font-lato text-2xl font-bold">{t('app:employmeny-information.substantive-position-heading')}</h2>
              <InputSelect
                id="substantivePosition"
                name="substantivePosition"
                errorMessage={t(extractValidationKey(errors?.substantivePosition))}
                required
                options={substantivePositionOptions}
                label={t('app:employmeny-information.substantive-position-group-and-level')}
                defaultValue={loaderData.defaultValues.substantivePosition ?? ''}
                className="w-full sm:w-1/2"
              />
              <InputSelect
                id="branchOrServiceCanadaRegion"
                name="branchOrServiceCanadaRegion"
                errorMessage={t(extractValidationKey(errors?.branchOrServiceCanadaRegion))}
                required
                options={branchOrServiceCanadaRegionOptions}
                label={t('app:employmeny-information.branch-or-service-canada-region')}
                defaultValue={loaderData.defaultValues.branchOrServiceCanadaRegion ?? ''}
                className="w-full sm:w-1/2"
              />
              <InputSelect
                id="directorate"
                name="directorate"
                errorMessage={t(extractValidationKey(errors?.directorate))}
                required
                options={directorateOptions}
                label={t('app:employmeny-information.branch-or-service-canada-region')}
                defaultValue={loaderData.defaultValues.directorate ?? ''}
                className="w-full sm:w-1/2"
              />
              <InputSelect
                className="w-full sm:w-1/2"
                id="province"
                name="province"
                label={t('app:employmeny-information.provinces')}
                options={provinceOptions}
                errorMessage={t(extractValidationKey(errors?.province))}
                value={province}
                onChange={({ target }) => setProvince(target.value)}
                required
              />
              {province && (
                <>
                  <InputSelect
                    id="city"
                    name="city"
                    errorMessage={t(extractValidationKey(errors?.city))}
                    required
                    options={cityOptions}
                    label={t('app:employmeny-information.city')}
                    defaultValue={loaderData.defaultValues.city ?? ''}
                    className="w-full sm:w-1/2"
                  />
                </>
              )}
              <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
                <Button name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink file="routes/profile/index.tsx" id="cancel-button" variant="alternative">
                  {t('app:form.cancel')}
                </ButtonLink>
              </div>
            </div>
          </Form>
        </ActionDataErrorSummary>
      </div>
    </>
  );
}
