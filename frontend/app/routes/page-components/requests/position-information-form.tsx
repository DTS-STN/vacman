import { useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';

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
import { InputCheckboxes } from '~/components/input-checkboxes';
import { InputField } from '~/components/input-field';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
import { InputMultiSelect } from '~/components/input-multiselect';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { useLanguage } from '~/hooks/use-language';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { buildExpiredAwareSelectOptions, isLookupExpired } from '~/utils/lookup-utils';
import { extractValidationKey, normalizeErrors } from '~/utils/validation-utils';

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
  isSubmitting?: boolean;
}

export function PositionInformationForm({
  cancelLink,
  formValues,
  languageRequirements,
  classifications,
  provinces,
  cities,
  securityClearances,
  formErrors: baseFormErrors,
  params,
  isSubmitting,
}: PositionInformationFormProps): JSX.Element {
  const formErrors = normalizeErrors(baseFormErrors);
  const { currentLanguage } = useLanguage();
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const defaultPositionNumber = formValues?.positionNumber ?? '';

  const [province, setProvince] = useState(
    formValues?.cities?.[0]?.provinceTerritory.id !== undefined ? String(formValues.cities[0].provinceTerritory.id) : undefined,
  );

  const [selectedCities, setSelectedCities] = useState(formValues?.cities?.map(({ id }) => id.toString()) ?? []);

  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Build groupAndLevelOptions with expired classification handling
  const groupAndLevelOptions = buildExpiredAwareSelectOptions({
    activeItems: classifications,
    selectedItem: formValues?.classification,
    language: currentLanguage ?? 'en',
    selectOptionLabel: tApp('form.select-option'),
  });

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

  const languageRequirementOptions = languageRequirements.map((option) => ({
    value: String(option.id),
    children: option.name,
    defaultChecked: formValues?.languageRequirements?.find((req) => req.id === option.id) !== undefined,
  }));

  // Choice tags for cities
  const citiesChoiceTags: ChoiceTag[] = selectedCities
    .map((city) => {
      const selectedCity = cities.find((c) => c.id === Number(city));
      if (selectedCity) {
        // Check if the city is expired using the expiryDate from the API
        const isExpired = isLookupExpired(selectedCity);
        return {
          label: selectedCity.name,
          name: tApp('position-information.choice-tag.city'),
          value: city,
          group: selectedCity.provinceTerritory.name,
          invalid: isExpired,
        };
      }
      // Fallback: city not found in list (wouldn't happen with upcoming new API behavior)
      const missingCity = formValues?.cities?.find((c) => c.id === Number(city));
      if (missingCity) {
        return {
          label: currentLanguage === 'en' ? missingCity.nameEn : missingCity.nameFr,
          name: tApp('position-information.choice-tag.city'),
          value: city,
          group: currentLanguage === 'en' ? missingCity.provinceTerritory.nameEn : missingCity.provinceTerritory.nameFr,
          invalid: true,
        };
      }
    })
    .filter((cityTag) => cityTag !== undefined);

  const handleOnDeleteCityTag: ChoiceTagDeleteEventHandler = (name, label, value, group) => {
    setSrAnnouncement(
      tGcweb('choice-tag.removed-choice-tag-sr-message', { item: name, choice: group ? group + ' - ' + label : label }),
    );
    setSelectedCities((prev) => prev.filter((cityId) => cityId !== value));
  };

  const handleOnClearAllCities: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(tGcweb('choice-tag.clear-all-sr-message', { item: tApp('position-information.choice-tag.cities') }));
    setSelectedCities([]);
  };

  const handleOnClearCityGroup = (groupName: string) => {
    setSrAnnouncement(
      tGcweb('choice-tag.clear-group-sr-message', { item: tApp('position-information.choice-tag.cities'), groupName }),
    );
    setSelectedCities((prev) =>
      prev.filter((cityId) => {
        const city = cities.find((c) => c.id === Number(cityId));
        return city?.provinceTerritory.name !== groupName;
      }),
    );
  };

  const handleSelectAllLocations = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSrAnnouncement(tApp('position-information.select-all-sr'));
    setSelectedCities(cities.map(({ id }) => id.toString()));
    setProvince((provinces.at(0)?.id ?? 0).toString());
  };

  const handleSelectAllCities = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selectedP = provinces.find((p) => p.id === Number(province));
    setSrAnnouncement(tApp('position-information.select-all-cities-sr', { province: selectedP?.name }));
    const selectedC = cities.filter((c) => c.provinceTerritory.id === Number(province));
    const newCityIds = selectedC.map(({ id }) => id.toString());
    setSelectedCities((prev) => [...new Set([...prev, ...newCityIds])]);
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
              defaultValue={defaultPositionNumber}
              errorMessage={tApp(extractValidationKey(formErrors?.positionNumber))}
              helpMessagePrimary={tApp('position-information.position-number-instruction')}
              maxLength={100}
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
              maxLength={200}
            />
            <InputField
              className="w-full"
              id="title-fr"
              name="titleFr"
              label={tApp('position-information.title-fr')}
              defaultValue={formValues?.frenchTitle}
              errorMessage={tApp(extractValidationKey(formErrors?.titleFr))}
              required
              maxLength={200}
            />

            <fieldset id="location-fieldset" aria-describedby="locationLegend" className="space-y-4">
              <InputLegend id="locationLegend" className="text-xl" required>
                {tApp('position-information.locations')}
              </InputLegend>
              <fieldset className="space-y-2" id="location-province-fieldset" aria-describedby="location-province-legend">
                <InputLegend id="location-province-legend" required>
                  {tApp('position-information.province')}
                </InputLegend>
                <InputHelp id="locationHelpMessage">{tApp('position-information.select-locations')}</InputHelp>
                <Button variant="primary" onClick={handleSelectAllLocations} aria-describedby="locationHelpMessage">
                  {tApp('position-information.select-all')}
                </Button>
                <InputSelect
                  ariaDescribedbyId="locationHelpMessage"
                  id="province"
                  name="province"
                  label=""
                  options={provinceOptions}
                  value={province ?? ''}
                  onChange={({ target }) => setProvince(target.value || undefined)}
                  errorMessage={tApp(extractValidationKey(formErrors?.province))}
                  className="w-full sm:w-1/2"
                />
              </fieldset>
              {province && (
                <fieldset className="space-y-2" id="location-cities-fieldset" aria-describedby="location-cities-legend">
                  <InputLegend id="location-cities-legend" required>
                    {tApp('position-information.city')}
                  </InputLegend>
                  <InputHelp id="selectCitiesLegend">{tApp('position-information.select-all-cities-help message')}</InputHelp>
                  <Button variant="primary" onClick={handleSelectAllCities} aria-describedby="selectCitiesLegend">
                    {tApp('position-information.select-all-cities')}
                  </Button>
                  <InputMultiSelect
                    ariaDescribedbyId="selectCitiesLegend"
                    id="cities"
                    name="cities"
                    errorMessage={tApp(extractValidationKey(formErrors?.cities))}
                    options={cityOptions}
                    value={selectedCities}
                    onChange={(values) => setSelectedCities(values)}
                    placeholder={tApp('form.select-all-that-apply')}
                    legend=""
                    className="w-full sm:w-1/2"
                  />
                </fieldset>
              )}

              {citiesChoiceTags.length > 0 && (
                <ChoiceTags
                  choiceTags={citiesChoiceTags}
                  onClearAll={handleOnClearAllCities}
                  onDelete={handleOnDeleteCityTag}
                  onClearGroup={handleOnClearCityGroup}
                />
              )}
            </fieldset>

            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {srAnnouncement}
            </span>

            <InputCheckboxes
              id="language-requirements"
              name="languageRequirements"
              legend={tApp('position-information.language-requirement')}
              options={languageRequirementOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.languageRequirements))}
              required
            />
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
              <LoadingButton name="action" variant="primary" id="save-button" disabled={isSubmitting} loading={isSubmitting}>
                {tApp('form.save')}
              </LoadingButton>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
