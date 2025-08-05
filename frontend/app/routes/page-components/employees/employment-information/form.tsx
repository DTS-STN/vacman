import { useState } from 'react';
import type { JSX } from 'react';

import type { Params } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedBranch,
  LocalizedCity,
  LocalizedClassification,
  LocalizedDirectorate,
  LocalizedProvince,
  LocalizedWFAStatus,
  User,
  UserEmploymentInformation,
} from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { DatePickerField } from '~/components/date-picker-field';
import { FormErrorSummary } from '~/components/error-summary';
import { InputSelect } from '~/components/input-select';
import { EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/employees/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface EmploymentProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<UserEmploymentInformation> | undefined;
  formErrors?: Errors;
  substantivePositions: readonly LocalizedClassification[];
  branchOrServiceCanadaRegions: readonly LocalizedBranch[];
  directorates: readonly LocalizedDirectorate[];
  provinces: readonly LocalizedProvince[];
  cities: readonly LocalizedCity[];
  wfaStatuses: readonly LocalizedWFAStatus[];
  hrAdvisors: readonly User[];
  params: Params;
}

export function EmploymentInformationForm({
  cancelLink,
  formValues,
  formErrors,
  substantivePositions,
  branchOrServiceCanadaRegions,
  directorates,
  provinces,
  cities,
  wfaStatuses,
  hrAdvisors,
  params,
}: EmploymentProps): JSX.Element {
  const { t } = useTranslation('app');

  const [branch, setBranch] = useState(
    formValues?.branchOrServiceCanadaRegion ? String(formValues.branchOrServiceCanadaRegion) : undefined,
  );
  const [province, setProvince] = useState(formValues?.province ? String(formValues.province) : undefined);
  const [wfaStatusCode, setWfaStatusCode] = useState(wfaStatuses.find((c) => c.id === formValues?.wfaStatus)?.code);

  const substantivePositionOptions = [{ id: 'select-option', name: '' }, ...substantivePositions].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const branchOrServiceCanadaRegionOptions = [{ id: 'select-option', name: '' }, ...branchOrServiceCanadaRegions].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? t('form.select-option') : name,
    }),
  );

  const directorateOptions = [
    { id: 'select-option', name: '' },
    ...directorates.filter((c) => c.parent?.id === Number(branch)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const provinceOptions = [{ id: 'select-option', name: '' }, ...provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const cityOptions = [{ id: 'select-option', name: '' }, ...cities.filter((c) => c.province.id === Number(province))].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? t('form.select-option') : name,
    }),
  );

  const wfaStatusOptions = [{ id: 'select-option', name: '' }, ...wfaStatuses].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const hrAdvisorOptions = [{ id: 'select-option', uuName: '' }, ...hrAdvisors].map(({ id, uuName }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : uuName,
  }));

  const handleWFAStatusChange = (optionValue: string) => {
    const selectedStatus = wfaStatuses.find((c) => c.id === Number(optionValue))?.code;
    setWfaStatusCode(selectedStatus);
  };

  return (
    <>
      <h1 className="my-5 text-3xl font-semibold">{t('employment-information.page-title')}</h1>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <h2 className="font-lato text-2xl font-bold">{t('employment-information.substantive-position-heading')}</h2>
            <InputSelect
              id="substantivePosition"
              name="substantivePosition"
              errorMessage={t(extractValidationKey(formErrors?.substantivePosition))}
              required
              options={substantivePositionOptions}
              label={t('employment-information.substantive-position-group-and-level')}
              defaultValue={formValues?.substantivePosition ? String(formValues.substantivePosition) : ''}
              className="w-full sm:w-1/2"
            />
            <InputSelect
              id="branchOrServiceCanadaRegion"
              name="branchOrServiceCanadaRegion"
              errorMessage={t(extractValidationKey(formErrors?.branchOrServiceCanadaRegion))}
              required
              onChange={({ target }) => setBranch(target.value || undefined)}
              options={branchOrServiceCanadaRegionOptions}
              label={t('employment-information.branch-or-service-canada-region')}
              defaultValue={formValues?.branchOrServiceCanadaRegion ? String(formValues.branchOrServiceCanadaRegion) : ''}
              className="w-full sm:w-1/2"
            />
            {branch && (
              <InputSelect
                id="directorate"
                name="directorate"
                errorMessage={t(extractValidationKey(formErrors?.directorate))}
                required
                options={directorateOptions}
                label={t('employment-information.directorate')}
                defaultValue={formValues?.directorate ? String(formValues.directorate) : ''}
                className="w-full sm:w-1/2"
              />
            )}
            <InputSelect
              className="w-full sm:w-1/2"
              id="province"
              name="province"
              label={t('employment-information.provinces')}
              options={provinceOptions}
              errorMessage={t(extractValidationKey(formErrors?.province))}
              value={province ?? ''}
              onChange={({ target }) => setProvince(target.value || undefined)}
              required
            />
            {province && (
              <>
                <InputSelect
                  id="cityId"
                  name="cityId"
                  errorMessage={t(extractValidationKey(formErrors?.cityId))}
                  required
                  options={cityOptions}
                  label={t('employment-information.city')}
                  defaultValue={formValues?.cityId ? String(formValues.cityId) : ''}
                  className="w-full sm:w-1/2"
                />
              </>
            )}

            <h2 className="font-lato text-2xl font-bold">{t('employment-information.wfa-detils-heading')}</h2>
            <p>{t('employment-information.wfa-detils')}</p>
            <InputSelect
              id="wfaStatus"
              name="wfaStatus"
              errorMessage={t(extractValidationKey(formErrors?.wfaStatus))}
              required
              options={wfaStatusOptions}
              label={t('employment-information.wfa-status')}
              defaultValue={formValues?.wfaStatus ? String(formValues.wfaStatus) : ''}
              onChange={({ target }) => handleWFAStatusChange(target.value)}
              className="w-full sm:w-1/2"
            />
            {(wfaStatusCode === EMPLOYEE_WFA_STATUS.opting ||
              wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusGRJO ||
              wfaStatusCode === EMPLOYEE_WFA_STATUS.surplusOptingOptionA) && (
              <>
                <DatePickerField
                  defaultValue={formValues?.wfaEffectiveDate ?? ''}
                  id="wfaEffectiveDate"
                  legend={t('employment-information.wfa-effective-date')}
                  names={{
                    day: 'wfaEffectiveDateDay',
                    month: 'wfaEffectiveDateMonth',
                    year: 'wfaEffectiveDateYear',
                  }}
                  errorMessages={{
                    all: t(extractValidationKey(formErrors?.wfaEffectiveDate)),
                    year: t(extractValidationKey(formErrors?.wfaEffectiveDateYear)),
                    month: t(extractValidationKey(formErrors?.wfaEffectiveDateMonth)),
                    day: t(extractValidationKey(formErrors?.wfaEffectiveDateDay)),
                  }}
                  required
                />
                <DatePickerField
                  defaultValue={formValues?.wfaEndDate ?? ''}
                  id="wfaEndDate"
                  legend={t('employment-information.wfa-end-date')}
                  names={{
                    day: 'wfaEndDateDay',
                    month: 'wfaEndDateMonth',
                    year: 'wfaEndDateYear',
                  }}
                  errorMessages={{
                    all: t(extractValidationKey(formErrors?.wfaEndDate)),
                    year: t(extractValidationKey(formErrors?.wfaEndDateYear)),
                    month: t(extractValidationKey(formErrors?.wfaEndDateMonth)),
                    day: t(extractValidationKey(formErrors?.wfaEndDateDay)),
                  }}
                />
              </>
            )}
            <InputSelect
              id="hrAdvisor"
              name="hrAdvisor"
              errorMessage={t(extractValidationKey(formErrors?.hrAdvisor))}
              required
              options={hrAdvisorOptions}
              label={t('employment-information.hr-advisor')}
              defaultValue={formValues?.hrAdvisor ? String(formValues.hrAdvisor) : ''}
              className="w-full sm:w-1/2"
            />
            <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
              <Button name="action" variant="primary" id="save-button">
                {t('form.save')}
              </Button>
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {t('form.cancel')}
              </ButtonLink>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
