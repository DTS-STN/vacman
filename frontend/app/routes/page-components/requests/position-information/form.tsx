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
import type {
  ChoiceTag,
  DeleteEventHandler as ChoiceTagDeleteEventHandler,
  ClearAllEventHandler as ChoiceTagClearAllEventHandler,
} from '~/components/choice-tags';
import { ChoiceTags } from '~/components/choice-tags';
import { FormErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
import { InputMultiSelect } from '~/components/input-multiselect';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { PageTitle } from '~/components/page-title';
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
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const [province, setProvince] = useState(
    formValues?.cities?.[0]?.provinceTerritory.id !== undefined ? String(formValues.cities[0].provinceTerritory.id) : undefined,
  );

  const [selectedCities, setSelectedCities] = useState(formValues?.cities?.map(({ id }) => id.toString()) ?? []);

  const [languageRequirementCode, setLanguageRequirementCode] = useState(
    languageRequirements.find((c) => c.id === formValues?.languageRequirement?.id)?.code,
  );

  const [srAnnouncement, setSrAnnouncement] = useState('');

  const handleLanguageRequirementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const selectedStatus = languageRequirements.find((c) => c.id === Number(selectedValue))?.code;
    setLanguageRequirementCode(selectedStatus);
  };

  const groupAndLevelOptions = [{ id: 'select-option', name: '' }, ...classifications].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? tApp('form.select-option') : name,
  }));

  const languageLevelOptions = [{ id: 'select-option', value: '' }, ...LANGUAGE_LEVEL].map(({ id, value }) => ({
    value: id === 'select-option' ? '' : value,
    children: id === 'select-option' ? tApp('form.select') : value,
  }));

  const provinceOptions = [{ id: 'select-option', name: '' }, ...provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? tApp('form.select-option') : name,
  }));

  const cityOptions = cities
    .filter((c) => c.provinceTerritory.id === Number(province))
    .map((city) => ({
      value: String(city.id),
      label: city.name,
      group: city.provinceTerritory.name,
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

  const citiesChoiceTags: ChoiceTag[] = selectedCities.map((city) => {
    const selectedC = cities.find((c) => c.id === Number(city));
    return { label: selectedC?.name ?? city, name: 'city', value: city, group: selectedC?.provinceTerritory.name };
  });

  const handleOnDeleteCityTag: ChoiceTagDeleteEventHandler = (name, label, value, group) => {
    setSrAnnouncement(
      tGcweb('choice-tag.removed-choice-tag-sr-message', { item: name, choice: group ? group + ' - ' + label : label }),
    );
    setSelectedCities((prev) => prev.filter((cityId) => cityId !== value));
  };

  const handleOnClearAllCities: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(tGcweb('choice-tag.clear-all-sr-message', { item: 'cities' }));
    setSelectedCities([]);
  };

  const handleOnClearCityGroup = (groupName: string) => {
    setSrAnnouncement(tGcweb('choice-tag.clear-group-label', { items: 'cities', groupName }));
    setSelectedCities((prev) =>
      prev.filter((cityId) => {
        const city = cities.find((c) => c.id === Number(cityId));
        return city?.provinceTerritory.name !== groupName;
      }),
    );
  };

  return (
    <>
      <PageTitle className="after:w-14" subTitle={tApp('referral-request')}>
        {tApp('position-information.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputField
              className="w-full"
              id="position-number"
              name="positionNumber"
              label={tApp('position-information.position-number')}
              defaultValue={formValues?.positionNumber}
              errorMessage={tApp(extractValidationKey(formErrors?.positionNumber))}
              helpMessagePrimary={tApp('position-information.position-number-instruction')}
              required
            />
            <InputSelect
              id="group-and-level"
              name="groupAndLevel"
              errorMessage={tApp(extractValidationKey(formErrors?.groupAndLevel))}
              required
              options={groupAndLevelOptions}
              label={tApp('employment-information.substantive-position-group-and-level')}
              defaultValue={formValues?.classification !== undefined ? String(formValues.classification.id) : ''}
              className="w-full sm:w-1/2"
            />
            <InputField
              className="w-full"
              id="title-en"
              name="titleEn"
              label={tApp('position-information.title-en')}
              defaultValue={formValues?.englishTitle}
              errorMessage={tApp(extractValidationKey(formErrors?.titleEn))}
              required
            />
            <InputField
              className="w-full"
              id="title-fr"
              name="titleFr"
              label={tApp('position-information.title-fr')}
              defaultValue={formValues?.frenchTitle}
              errorMessage={tApp(extractValidationKey(formErrors?.titleFr))}
              required
            />
            <InputLegend id="locationLegend" required>
              {tApp('position-information.locations')}
            </InputLegend>
            <InputHelp id="locationHelpMessage">{tApp('position-information.select-locations')}</InputHelp>
            <InputSelect
              ariaDescribedbyId="locationHelpMessage"
              id="province"
              name="province"
              label={tApp('position-information.province')}
              options={provinceOptions}
              value={province ?? ''}
              onChange={({ target }) => setProvince(target.value || undefined)}
              errorMessage={tApp(extractValidationKey(formErrors?.province))}
              className="w-full sm:w-1/2"
              required
            />
            {province && (
              <InputMultiSelect
                id="cities"
                name="cities"
                errorMessage={tApp(extractValidationKey(formErrors?.cities))}
                options={cityOptions}
                value={selectedCities}
                onChange={(values) => setSelectedCities(values)}
                placeholder={tApp('form.select-all-that-apply')}
                legend={tApp('position-information.city')}
                className="w-full sm:w-1/2"
                required
              />
            )}

            {citiesChoiceTags.length > 0 && (
              <ChoiceTags
                choiceTags={citiesChoiceTags}
                onClearAll={handleOnClearAllCities}
                onDelete={handleOnDeleteCityTag}
                onClearGroup={handleOnClearCityGroup}
              />
            )}

            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {srAnnouncement}
            </span>

            <InputRadios
              id="language-requirement"
              name="languageRequirement"
              legend={tApp('position-information.language-requirement')}
              options={languageRequirementOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.languageRequirement))}
              required
            />
            {(languageRequirementCode === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
              languageRequirementCode === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative) && (
              <>
                <InputLegend required>{tApp('position-information.language-profile')}</InputLegend>
                <h3 className="font-semibold">{tApp('position-information.reading-comprehension')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="reading-en"
                    name="readingEn"
                    label={tApp('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(0) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.readingEn))}
                  />
                  <InputSelect
                    id="reading-fr"
                    name="readingFr"
                    label={tApp('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(0) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.readingFr))}
                  />
                </div>
                <h3 className="font-semibold">{tApp('position-information.written-expression')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="writing-en"
                    name="writingEn"
                    label={tApp('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(1) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.writingEn))}
                  />
                  <InputSelect
                    id="writing-fr"
                    name="writingFr"
                    label={tApp('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(1) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.writingFr))}
                  />
                </div>
                <h3 className="font-semibold">{tApp('position-information.oral-proficiency')}</h3>
                <div className="flex space-x-2">
                  <InputSelect
                    id="oral-en"
                    name="oralEn"
                    label={tApp('position-information.english')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.englishLanguageProfile?.charAt(2) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.oralEn))}
                  />
                  <InputSelect
                    id="oral-fr"
                    name="oralFr"
                    label={tApp('position-information.french')}
                    className="w-32"
                    options={languageLevelOptions}
                    defaultValue={formValues?.frenchLanguageProfile?.charAt(2) ?? ''}
                    errorMessage={tApp(extractValidationKey(formErrors?.oralFr))}
                  />
                </div>
              </>
            )}
            <InputRadios
              id="security-requirement"
              name="securityRequirement"
              legend={tApp('position-information.security-requirement')}
              options={securityClearanceOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.securityRequirement))}
              required
            />
            <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
              <Button name="action" variant="primary" id="save-button">
                {tApp('form.save')}
              </Button>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
