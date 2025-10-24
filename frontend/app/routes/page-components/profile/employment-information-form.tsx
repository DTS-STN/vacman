import { useState } from 'react';
import type { JSX } from 'react';

import type { Params } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedBranch,
  LocalizedCity,
  LocalizedClassification,
  LocalizedProvince,
  LocalizedWFAStatus,
  LocalizedWorkUnit,
  Profile,
  User,
} from '~/.server/domain/models';
import { ButtonLink } from '~/components/button-link';
import { DatePickerField } from '~/components/date-picker-field';
import { FormErrorSummary } from '~/components/error-summary';
import { InputLegend } from '~/components/input-legend';
import { InputSelect } from '~/components/input-select';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { WFA_STATUS } from '~/domain/constants';
import { useLanguage } from '~/hooks/use-language';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/profile/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface EmploymentProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<Profile> | undefined;
  formErrors?: Errors;
  substantivePositions: readonly LocalizedClassification[];
  branchOrServiceCanadaRegions: readonly LocalizedBranch[];
  directorates: readonly LocalizedWorkUnit[];
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
  const { currentLanguage } = useLanguage();

  const [branch, setBranch] = useState(
    formValues?.substantiveWorkUnit ? String(formValues.substantiveWorkUnit.parent?.id) : undefined,
  );
  const [directorate, setDirectorate] = useState(
    formValues?.substantiveWorkUnit !== undefined ? String(formValues.substantiveWorkUnit.id) : undefined,
  );
  const [province, setProvince] = useState(
    formValues?.substantiveCity?.provinceTerritory !== undefined
      ? String(formValues.substantiveCity.provinceTerritory.id)
      : undefined,
  );
  const [wfaStatusCode, setWfaStatusCode] = useState(wfaStatuses.find((c) => c.id === formValues?.wfaStatus?.id)?.code);

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

  const cityOptions = [
    { id: 'select-option', name: '' },
    ...cities.filter((c) => c.provinceTerritory.id === Number(province)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const wfaStatusOptions = [{ id: 'select-option', name: '' }, ...wfaStatuses].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const handleWFAStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const selectedStatus = wfaStatuses.find((c) => c.id === Number(selectedValue))?.code;
    setWfaStatusCode(selectedStatus);
  };

  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = event.target.value;
    setBranch(newBranch);

    // Clear directorate if the new branch has no child directorates
    if (newBranch) {
      const hasChildren = directorates.some((directorate) => directorate.parent?.id === Number(newBranch));
      if (!hasChildren) {
        setDirectorate(undefined);
      }
    } else {
      setDirectorate(undefined);
    }
  };

  const hrAdvisorOptions = [{ id: 'select-option', firstName: '', lastName: '' }, ...hrAdvisors]
    .sort((advisor1, advisor2) => {
      const compareResult = (advisor1.firstName ?? '').localeCompare(advisor2.firstName ?? '', currentLanguage ?? 'en');
      if (compareResult !== 0) return compareResult;
      return (advisor1.lastName ?? '').localeCompare(advisor2.lastName ?? '', currentLanguage ?? 'en');
    })
    .map(({ id, firstName, lastName }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? t('form.select-option') : `${firstName} ${lastName}`,
    }));

  return (
    <>
      <PageTitle className="after:w-14">{t('employment-information.page-title')}</PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <h2 className="font-lato text-2xl font-bold">{t('employment-information.substantive-position-heading')}</h2>
            <InputSelect
              id="substantiveClassification"
              name="substantiveClassification"
              errorMessage={t(extractValidationKey(formErrors?.substantiveClassification))}
              required
              options={substantivePositionOptions}
              label={t('employment-information.substantive-position-group-and-level')}
              defaultValue={
                formValues?.substantiveClassification !== undefined ? String(formValues.substantiveClassification.id) : ''
              }
              className="w-full sm:w-1/2"
            />
            <InputSelect
              id="branchOrServiceCanadaRegion"
              name="branchOrServiceCanadaRegion"
              errorMessage={t(extractValidationKey(formErrors?.branchOrServiceCanadaRegion))}
              required
              onChange={handleBranchChange}
              options={branchOrServiceCanadaRegionOptions}
              label={t('employment-information.branch-or-service-canada-region')}
              defaultValue={
                formValues?.substantiveWorkUnit !== undefined ? String(formValues.substantiveWorkUnit.parent?.id) : ''
              }
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
                value={directorate ?? ''}
                onChange={({ target }) => setDirectorate(target.value || undefined)}
                className="w-full sm:w-1/2"
              />
            )}
            <InputSelect
              className="w-full sm:w-1/2"
              id="province"
              name="province"
              label={t('employment-information.provinces')}
              options={provinceOptions}
              errorMessage={t(extractValidationKey(formErrors?.provinceId))}
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
                  defaultValue={formValues?.substantiveCity !== undefined ? String(formValues.substantiveCity.id) : ''}
                  className="w-full sm:w-1/2"
                />
              </>
            )}

            <h2 className="font-lato text-2xl font-bold">{t('employment-information.wfa-details-heading')}</h2>
            <fieldset id="wfaDetailsFieldset" className="space-y-6">
              <InputLegend id="wfaDetailsLegend" childrenClassName="font-normal">
                {t('employment-information.wfa-details')}
              </InputLegend>
              <InputSelect
                ariaDescribedbyId="wfaDetailsLegend"
                id="wfaStatus"
                name="wfaStatus"
                errorMessage={t(extractValidationKey(formErrors?.wfaStatusId))}
                required
                options={wfaStatusOptions}
                label={t('employment-information.wfa-status')}
                defaultValue={formValues?.wfaStatus !== undefined ? String(formValues.wfaStatus.id) : ''}
                onChange={handleWFAStatusChange}
              />
            </fieldset>

            <h2 className="font-lato text-2xl font-bold">{t('employment-information.wfa-dates-heading')}</h2>
            <fieldset id="wfaDatesDetailsFieldset" className="space-y-6">
              <InputLegend id="wfaDatesDetailsLegend" childrenClassName="font-normal">
                {t('employment-information.wfa-dates-details')}
              </InputLegend>
              <DatePickerField
                ariaDescribedbyId="wfaDatesDetailsLegend"
                defaultValue={formValues?.wfaStartDate ?? ''}
                id="wfaStartDate"
                legend={t('employment-information.wfa-effective-date')}
                names={{
                  day: 'wfaStartDateDay',
                  month: 'wfaStartDateMonth',
                  year: 'wfaStartDateYear',
                }}
                errorMessages={{
                  all: t(extractValidationKey(formErrors?.wfaStartDate)),
                  year: t(extractValidationKey(formErrors?.wfaStartDateYear)),
                  month: t(extractValidationKey(formErrors?.wfaStartDateMonth)),
                  day: t(extractValidationKey(formErrors?.wfaStartDateDay)),
                }}
                required
              />
              {(wfaStatusCode === WFA_STATUS.OPTING.code ||
                wfaStatusCode === WFA_STATUS.OPTING_EX.code ||
                wfaStatusCode === WFA_STATUS.SURPLUS_NO_GRJO.code ||
                wfaStatusCode === WFA_STATUS.EXSURPLUSCPA.code ||
                wfaStatusCode === WFA_STATUS.RELOCATION.code ||
                wfaStatusCode === WFA_STATUS.ALTERNATE_DELIVERY.code) && (
                <>
                  <DatePickerField
                    ariaDescribedbyId="wfaDatesDetailsLegend"
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
            </fieldset>

            <InputSelect
              ariaDescribedbyId="wfaDetailsLegend"
              id="hrAdvisorId"
              name="hrAdvisorId"
              errorMessage={t(extractValidationKey(formErrors?.hrAdvisorId))}
              required
              options={hrAdvisorOptions}
              label={t('employment-information.hr-advisor')}
              defaultValue={formValues?.hrAdvisorId ? String(formValues.hrAdvisorId) : ''}
              className="w-full sm:w-1/2"
            />

            <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {t('form.cancel')}
              </ButtonLink>
              <LoadingButton name="action" variant="primary" id="save-button">
                {t('form.save')}
              </LoadingButton>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
