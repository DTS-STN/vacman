import { useState } from 'react';
import type { JSX } from 'react';

import type { Params } from 'react-router';
import { Form } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedCity,
  LocalizedClassification,
  LocalizedLanguageRequirement,
  LocalizedProvince,
  LocalizedSecurityClearance,
  RequestReadModel,
} from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputLegend } from '~/components/input-legend';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { LANGUAGE_LEVEL, LANGUAGE_REQUIREMENT_CODES } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface PositionInformationFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<RequestReadModel> | undefined;
  languageRequirements: readonly LocalizedLanguageRequirement[];
  classifications: readonly LocalizedClassification[];
  provinces: readonly LocalizedProvince[];
  cities: readonly LocalizedCity[];
  securityClearances: readonly LocalizedSecurityClearance[];
  formErrors?: Errors;
  params: Params;
}

export function PositionInformationForm({
  cancelLink,
  formValues,
  languageRequirements,
  classifications,
  provinces,
  cities,
  securityClearances,
  formErrors,
  params,
}: PositionInformationFormProps): JSX.Element {
  const { t } = useTranslation('app');

  const [province, setProvince] = useState(
    formValues?.cities !== undefined ? String(formValues.cities[0]?.provinceTerritory.id) : undefined,
  );

  const [languageRequirementCode, setLanguageRequirementCode] = useState(
    languageRequirements.find((c) => c.id === formValues?.languageRequirement?.id)?.code,
  );

  const handleLanguageRequirementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const selectedStatus = languageRequirements.find((c) => c.id === Number(selectedValue))?.code;
    setLanguageRequirementCode(selectedStatus);
  };

  const groupAndLevelOptions = [{ id: 'select-option', name: '' }, ...classifications].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const languageLevelOptions = [{ id: 'select-option', value: '' }, ...LANGUAGE_LEVEL].map(({ id, value }) => ({
    value: id === 'select-option' ? '' : value,
    children: id === 'select-option' ? t('form.select') : value,
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

  const securityClearanceOptions = securityClearances.map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.securityClearance?.id,
  }));

  const languageRequirementOptions: InputRadiosProps['options'] = languageRequirements.map(({ id, name }) => ({
    value: String(id),
    children: name,
    onChange: handleLanguageRequirementChange,
    defaultChecked: formValues?.languageRequirement?.id === id,
  }));

  return (
    <>
      <h1 className="my-5 text-3xl font-semibold">{t('position-information.page-title')}</h1>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputField
              className="w-full"
              id="position-numbers"
              name="positionNumbers"
              label={t('position-information.position-number')}
              defaultValue={formValues?.positionNumber}
              errorMessage={t(extractValidationKey(formErrors?.positionNumbers))}
              helpMessagePrimary={t('position-information.position-number-instruction')}
              required
            />
            <InputSelect
              id="group-and-level"
              name="groupAndLevel"
              errorMessage={t(extractValidationKey(formErrors?.groupAndLevel))}
              required
              options={groupAndLevelOptions}
              label={t('employment-information.substantive-position-group-and-level')}
              defaultValue={formValues?.classification !== undefined ? String(formValues.classification.id) : ''}
              className="w-full sm:w-1/2"
            />
            <InputField
              className="w-full"
              id="title-en"
              name="titleEn"
              label={t('position-information.title-en')}
              defaultValue={formValues?.englishTitle}
              errorMessage={t(extractValidationKey(formErrors?.titleEn))}
              required
            />
            <InputField
              className="w-full"
              id="title-fr"
              name="titleFr"
              label={t('position-information.title-fr')}
              defaultValue={formValues?.frenchTitle}
              errorMessage={t(extractValidationKey(formErrors?.titleFr))}
              required
            />
            <InputSelect
              id="province"
              name="province"
              label={t('position-information.location-province')}
              options={provinceOptions}
              value={province ?? ''}
              onChange={({ target }) => setProvince(target.value || undefined)}
              errorMessage={t(extractValidationKey(formErrors?.province))}
              className="w-full sm:w-1/2"
              required
            />
            {province && (
              <InputSelect
                id="city"
                name="city"
                errorMessage={t(extractValidationKey(formErrors?.city))}
                required
                options={cityOptions}
                label={t('position-information.location-city')}
                // defaultValue={formValues?.cities[0]?.provinceTerritory.id !== undefined ? String(formValues.provinceId) : ''}
                className="w-full sm:w-1/2"
              />
            )}
            <InputRadios
              id="language-requirement"
              name="languageRequirement"
              legend={t('position-information.language-requirement')}
              options={languageRequirementOptions}
              errorMessage={t(extractValidationKey(formErrors?.languageRequirement))}
              required
            />
            {(languageRequirementCode === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
              languageRequirementCode === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative) && (
              <>
                <InputLegend required>{t('position-information.language-profile')}</InputLegend>
                <h3 className="font-semibold">{t('position-information.reading-comprehension')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="reading-en"
                    name="readingEn"
                    label={t('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(0) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.readingEn))}
                  />
                  <InputSelect
                    id="reading-fr"
                    name="readingFr"
                    label={t('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(0) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.readingFr))}
                  />
                </div>
                <h3 className="font-semibold">{t('position-information.written-expression')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="writing-en"
                    name="writingEn"
                    label={t('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(1) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.writingEn))}
                  />
                  <InputSelect
                    id="writing-fr"
                    name="writingFr"
                    label={t('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(1) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.writingFr))}
                  />
                </div>
                <h3 className="font-semibold">{t('position-information.oral-proficiency')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="oral-en"
                    name="oralEn"
                    label={t('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(2) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.oralEn))}
                  />
                  <InputSelect
                    id="oral-fr"
                    name="oralFr"
                    label={t('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(2) ?? ''}
                    errorMessage={t(extractValidationKey(formErrors?.oralFr))}
                  />
                </div>
              </>
            )}
            <InputRadios
              id="security-requirement"
              name="securityRequirement"
              legend={t('position-information.security-requirement')}
              options={securityClearanceOptions}
              errorMessage={t(extractValidationKey(formErrors?.securityRequirement))}
              required
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
