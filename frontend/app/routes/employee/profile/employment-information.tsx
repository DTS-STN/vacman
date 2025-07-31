import { useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/employment-information';

import type { Profile } from '~/.server/domain/models';
import { getBranchService } from '~/.server/domain/services/branch-service';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { DatePickerField } from '~/components/date-picker-field';
import { FormErrorSummary } from '~/components/error-summary';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import type { employmentInformationSchema } from '~/routes/employee/profile/validation.server';
import { parseEmploymentInformation } from '~/routes/employee/profile/validation.server';
import { handle as parentHandle } from '~/routes/layout';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  // Get the current user's ID from the authenticated session
  const authenticatedSession = context.session as AuthenticatedSession;
  const currentUserId = authenticatedSession.authState.idTokenClaims.oid as string;
  const formData = await request.formData();
  const { parseResult, formValues } = parseEmploymentInformation(formData);

  if (!parseResult.success) {
    return data(
      { formValues: formValues, errors: v.flatten<typeof employmentInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const updateResult = await getProfileService().updateEmploymentInformation(currentUserId, parseResult.output);

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/employee/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  // Use the id parameter from the URL to fetch the profile
  const profileUserId = params.id;
  const profileResult = await getProfileService().getProfile(profileUserId);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const substantivePositions = await getClassificationService().listAllLocalized(lang);
  const branchOrServiceCanadaRegions = await getBranchService().listAllLocalized(lang);
  const directorates = await getDirectorateService().listAllLocalized(lang);
  const provinces = await getProvinceService().listAllLocalized(lang);
  const cities = await getCityService().listAllLocalized(lang);
  const wfaStatuses = await getWFAStatuses().listAllLocalized(lang);
  const hrAdvisors = await getUserService().getUsersByRole('hr-advisor');
  const profileData: Profile = profileResult.unwrap();

  const workUnitResult =
    profileData.employmentInformation.directorate &&
    (await getDirectorateService().findLocalizedById(profileData.employmentInformation.directorate, lang));
  const workUnit = workUnitResult && workUnitResult.isSome() ? workUnitResult.unwrap() : undefined;
  const cityResult =
    profileData.employmentInformation.cityId &&
    (await getCityService().findLocalizedById(profileData.employmentInformation.cityId, lang));
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;

  return {
    documentTitle: t('app:employment-information.page-title'),
    defaultValues: {
      substantivePosition: profileData.employmentInformation.substantivePosition,
      branchOrServiceCanadaRegion: workUnit?.parent?.id,
      directorate: workUnit?.id,
      province: city?.province.id,
      cityId: profileData.employmentInformation.cityId,
      wfaStatus: profileData.employmentInformation.wfaStatus,
      wfaEffectiveDate: profileData.employmentInformation.wfaEffectiveDate,
      wfaEndDate: profileData.employmentInformation.wfaEndDate,
      hrAdvisor: profileData.employmentInformation.hrAdvisor,
    },
    substantivePositions: substantivePositions,
    branchOrServiceCanadaRegions: branchOrServiceCanadaRegions,
    directorates: directorates,
    provinces: provinces,
    cities: cities,
    wfaStatuses: wfaStatuses,
    hrAdvisors: hrAdvisors,
  };
}

export default function EmploymentInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;
  const [branch, setBranch] = useState(
    loaderData.defaultValues.branchOrServiceCanadaRegion
      ? String(loaderData.defaultValues.branchOrServiceCanadaRegion)
      : undefined,
  );
  const [province, setProvince] = useState(
    loaderData.defaultValues.province ? String(loaderData.defaultValues.province) : undefined,
  );
  const [wfaStatusCode, setWfaStatusCode] = useState(
    loaderData.wfaStatuses.find((c) => c.id === loaderData.defaultValues.wfaStatus)?.code,
  );

  const substantivePositionOptions = [{ id: 'select-option', name: '' }, ...loaderData.substantivePositions].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? t('app:form.select-option') : name,
    }),
  );

  const branchOrServiceCanadaRegionOptions = [
    { id: 'select-option', name: '' },
    ...loaderData.branchOrServiceCanadaRegions,
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const directorateOptions = [
    { id: 'select-option', name: '' },
    ...loaderData.directorates.filter((c) => c.parent?.id === Number(branch)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const provinceOptions = [{ id: 'select-option', name: '' }, ...loaderData.provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const cityOptions = [
    { id: 'select-option', name: '' },
    ...loaderData.cities.filter((c) => c.province.id === Number(province)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const wfaStatusOptions = [{ id: 'select-option', name: '' }, ...loaderData.wfaStatuses].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));

  const hrAdvisorOptions = [{ id: 'select-option', uuName: '' }, ...loaderData.hrAdvisors].map(({ id, uuName }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : uuName,
  }));

  const handleWFAStatusChange = (optionValue: string) => {
    const selectedStatus = loaderData.wfaStatuses.find((c) => c.id === Number(optionValue))?.code;
    setWfaStatusCode(selectedStatus);
  };

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:employment-information.page-title')}</h1>
        <FormErrorSummary>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <h2 className="font-lato text-2xl font-bold">{t('app:employment-information.substantive-position-heading')}</h2>
              <InputSelect
                id="substantivePosition"
                name="substantivePosition"
                errorMessage={t(extractValidationKey(errors?.substantivePosition))}
                required
                options={substantivePositionOptions}
                label={t('app:employment-information.substantive-position-group-and-level')}
                defaultValue={
                  loaderData.defaultValues.substantivePosition ? String(loaderData.defaultValues.substantivePosition) : ''
                }
                className="w-full sm:w-1/2"
              />
              <InputSelect
                id="branchOrServiceCanadaRegion"
                name="branchOrServiceCanadaRegion"
                errorMessage={t(extractValidationKey(errors?.branchOrServiceCanadaRegion))}
                required
                onChange={({ target }) => setBranch(target.value || undefined)}
                options={branchOrServiceCanadaRegionOptions}
                label={t('app:employment-information.branch-or-service-canada-region')}
                defaultValue={
                  loaderData.defaultValues.branchOrServiceCanadaRegion
                    ? String(loaderData.defaultValues.branchOrServiceCanadaRegion)
                    : ''
                }
                className="w-full sm:w-1/2"
              />
              {branch && (
                <InputSelect
                  id="directorate"
                  name="directorate"
                  errorMessage={t(extractValidationKey(errors?.directorate))}
                  required
                  options={directorateOptions}
                  label={t('app:employment-information.directorate')}
                  defaultValue={loaderData.defaultValues.directorate ? String(loaderData.defaultValues.directorate) : ''}
                  className="w-full sm:w-1/2"
                />
              )}
              <InputSelect
                className="w-full sm:w-1/2"
                id="province"
                name="province"
                label={t('app:employment-information.provinces')}
                options={provinceOptions}
                errorMessage={t(extractValidationKey(errors?.province))}
                value={province ?? ''}
                onChange={({ target }) => setProvince(target.value || undefined)}
                required
              />
              {province && (
                <>
                  <InputSelect
                    id="cityId"
                    name="cityId"
                    errorMessage={t(extractValidationKey(errors?.cityId))}
                    required
                    options={cityOptions}
                    label={t('app:employment-information.city')}
                    defaultValue={loaderData.defaultValues.cityId ? String(loaderData.defaultValues.cityId) : ''}
                    className="w-full sm:w-1/2"
                  />
                </>
              )}

              <h2 className="font-lato text-2xl font-bold">{t('app:employment-information.wfa-detils-heading')}</h2>
              <p>{t('app:employment-information.wfa-detils')}</p>
              <InputSelect
                id="wfaStatus"
                name="wfaStatus"
                errorMessage={t(extractValidationKey(errors?.wfaStatus))}
                required
                options={wfaStatusOptions}
                label={t('app:employment-information.wfa-status')}
                defaultValue={loaderData.defaultValues.wfaStatus ? String(loaderData.defaultValues.wfaStatus) : ''}
                onChange={({ target }) => handleWFAStatusChange(target.value)}
                className="w-full sm:w-1/2"
              />
              {(wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
                wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusGRJO ||
                wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA) && (
                <>
                  <DatePickerField
                    defaultValue={loaderData.defaultValues.wfaEffectiveDate ?? ''}
                    id="wfaEffectiveDate"
                    legend={t('app:employment-information.wfa-effective-date')}
                    names={{
                      day: 'wfaEffectiveDateDay',
                      month: 'wfaEffectiveDateMonth',
                      year: 'wfaEffectiveDateYear',
                    }}
                    errorMessages={{
                      all: t(extractValidationKey(errors?.wfaEffectiveDate)),
                      year: t(extractValidationKey(errors?.wfaEffectiveDateYear)),
                      month: t(extractValidationKey(errors?.wfaEffectiveDateMonth)),
                      day: t(extractValidationKey(errors?.wfaEffectiveDateDay)),
                    }}
                    required
                  />
                  <DatePickerField
                    defaultValue={loaderData.defaultValues.wfaEndDate ?? ''}
                    id="wfaEndDate"
                    legend={t('app:employment-information.wfa-end-date')}
                    names={{
                      day: 'wfaEndDateDay',
                      month: 'wfaEndDateMonth',
                      year: 'wfaEndDateYear',
                    }}
                    errorMessages={{
                      all: t(extractValidationKey(errors?.wfaEndDate)),
                      year: t(extractValidationKey(errors?.wfaEndDateYear)),
                      month: t(extractValidationKey(errors?.wfaEndDateMonth)),
                      day: t(extractValidationKey(errors?.wfaEndDateDay)),
                    }}
                  />
                </>
              )}
              <InputSelect
                id="hrAdvisor"
                name="hrAdvisor"
                errorMessage={t(extractValidationKey(errors?.hrAdvisor))}
                required
                options={hrAdvisorOptions}
                label={t('app:employment-information.hr-advisor')}
                defaultValue={loaderData.defaultValues.hrAdvisor ? String(loaderData.defaultValues.hrAdvisor) : ''}
                className="w-full sm:w-1/2"
              />
              <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
                <Button name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink file="routes/employee/profile/index.tsx" params={params} id="cancel-button" variant="alternative">
                  {t('app:form.cancel')}
                </ButtonLink>
              </div>
            </div>
          </Form>
        </FormErrorSummary>
      </div>
    </>
  );
}
