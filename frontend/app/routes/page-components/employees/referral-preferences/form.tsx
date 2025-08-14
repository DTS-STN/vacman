import { useState } from 'react';
import type { JSX } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedCity,
  LocalizedClassification,
  LocalizedEmploymentOpportunityType,
  LocalizedLanguageReferralType,
  LocalizedProvince,
  UserReferralPreferences,
} from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import type {
  ChoiceTag,
  DeleteEventHandler as ChoiceTagDeleteEventHandler,
  ClearAllEventHandler as ChoiceTagClearAllEventHandler,
} from '~/components/choice-tags';
import { ChoiceTags } from '~/components/choice-tags';
import { Collapsible } from '~/components/collapsible';
import { FormErrorSummary } from '~/components/error-summary';
import { InputCheckboxes } from '~/components/input-checkboxes';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
import { InputMultiSelect } from '~/components/input-multiselect';
import { InputRadios } from '~/components/input-radios';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/employees/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface ReferralPreferencesFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<UserReferralPreferences> | undefined;
  formErrors?: Errors;
  languageReferralTypes: readonly LocalizedLanguageReferralType[];
  classifications: readonly LocalizedClassification[];
  employmentOpportunities: readonly LocalizedEmploymentOpportunityType[];
  provinces: readonly LocalizedProvince[];
  cities: readonly LocalizedCity[];
  params: Params;
}

export function ReferralPreferencesForm({
  cancelLink,
  formValues,
  formErrors,
  languageReferralTypes,
  classifications,
  employmentOpportunities,
  provinces,
  cities,
  params,
}: ReferralPreferencesFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const [referralAvailibility, setReferralAvailibility] = useState(formValues?.availableForReferralInd);
  const [alternateOpportunity, setAlternateOpportunity] = useState(formValues?.interestedInAlternationInd);
  const [selectedClassifications, setSelectedClassifications] = useState(formValues?.classificationIds?.map(String) ?? []);
  const [selectedCities, setSelectedCities] = useState(formValues?.workLocationCitiesIds?.map(String) ?? []);
  const [province, setProvince] = useState(
    formValues?.workLocationProvince ? String(formValues.workLocationProvince) : undefined,
  );
  const [srAnnouncement, setSrAnnouncement] = useState(''); //screen reader announcement

  const languageReferralTypeOptions = languageReferralTypes.map((langReferral) => ({
    value: String(langReferral.id),
    children: langReferral.name,
    defaultChecked: formValues?.languageReferralTypeIds?.includes(langReferral.id) ?? false,
  }));
  const classificationOptions = classifications.map((classification) => ({
    value: String(classification.id),
    label: classification.name,
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
  const referralAvailibilityOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: referralAvailibility === true,
      onChange: ({ target }) => setReferralAvailibility(target.value === REQUIRE_OPTIONS.yes),
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: referralAvailibility === false,
      onChange: ({ target }) => setReferralAvailibility(target.value === REQUIRE_OPTIONS.yes),
    },
  ];
  const alternateOpportunityOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: alternateOpportunity === true,
      onChange: ({ target }) => setAlternateOpportunity(target.value === REQUIRE_OPTIONS.yes),
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: alternateOpportunity === false,
      onChange: ({ target }) => setAlternateOpportunity(target.value === REQUIRE_OPTIONS.yes),
    },
  ];
  const employmentOpportunityOptions = employmentOpportunities.map((employmentOpportunity) => ({
    value: String(employmentOpportunity.id),
    children: employmentOpportunity.name,
    defaultChecked: formValues?.employmentOpportunityIds?.includes(employmentOpportunity.id) ?? false,
  }));

  // Choice tags for classification
  const classificationChoiceTags: ChoiceTag[] = selectedClassifications
    .map((classification) => {
      const selectedC = classifications.find((c) => c.id === Number(classification));
      return { label: selectedC?.name ?? classification, name: 'classification', value: classification };
    })
    .toSorted((a, b) => String(a.label).localeCompare(String(b.label)));

  /**
   * Removes a classification from `classification group(s) and level(s)` and announces the removal to screen readers.
   */
  const handleOnDeleteClassificationTag: ChoiceTagDeleteEventHandler = (name, label, value) => {
    setSrAnnouncement(tGcweb('choice-tag.removed-choice-tag-sr-message', { item: name, choice: label }));
    setSelectedClassifications((prev) => prev.filter((classificationId) => classificationId !== value));
  };

  const handleOnClearAllClassifications: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(tGcweb('choice-tag.clear-all-sr-message', { item: 'classifications' }));
    setSelectedClassifications([]);
  };

  // Choice tags for cities
  const citiesChoiceTags: ChoiceTag[] = selectedCities.map((city) => {
    const selectedC = cities.find((c) => c.id === Number(city));
    return { label: selectedC?.name ?? city, name: 'city', value: city, group: selectedC?.provinceTerritory.name };
  });

  /**
   * Removes a city from `work locations` and announces the removal to screen readers.
   */
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
      <h1 className="my-5 text-3xl">{tApp('referral-preferences.page-title')}</h1>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputCheckboxes
              id="languageReferralTypesId"
              errorMessage={tApp(extractValidationKey(formErrors?.languageReferralTypeIds))}
              legend={tApp('referral-preferences.language-referral-type')}
              name="languageReferralTypes"
              options={languageReferralTypeOptions}
              helpMessagePrimary={tApp('form.select-all-that-apply')}
              required
            />
            <InputMultiSelect
              id="classificationsId"
              name="classifications"
              label={tApp('referral-preferences.classification')}
              options={classificationOptions}
              value={selectedClassifications}
              onChange={(values) => setSelectedClassifications(values)}
              placeholder={tApp('form.select-all-that-apply')}
              helpMessage={tApp('referral-preferences.classification-group-help-message-primary')}
              errorMessage={tApp(extractValidationKey(formErrors?.classificationIds))}
              required
            />

            {classificationChoiceTags.length > 0 && (
              <ChoiceTags
                choiceTags={classificationChoiceTags}
                onClearAll={handleOnClearAllClassifications}
                onDelete={handleOnDeleteClassificationTag}
              />
            )}

            <fieldset id="workLocationFieldset" className="space-y-2">
              <InputLegend id="workLocationLegend" required>
                {tApp('referral-preferences.work-location')}
              </InputLegend>
              <InputHelp id="workLocationHelpMessage">{tApp('form.select-all-that-apply')}</InputHelp>
              <InputSelect
                className="w-full sm:w-1/2"
                id="workLocationProvinceId"
                name="workLocationProvince"
                label={tApp('referral-preferences.province')}
                options={provinceOptions}
                errorMessage={tApp(extractValidationKey(formErrors?.workLocationProvince))}
                value={province ?? ''}
                onChange={({ target }) => setProvince(target.value || undefined)}
              />
              {province && (
                <>
                  <InputMultiSelect
                    id="workLocationCitiesId"
                    name="workLocationCities"
                    errorMessage={tApp(extractValidationKey(formErrors?.workLocationCitiesIds))}
                    options={cityOptions}
                    value={selectedCities}
                    onChange={(values) => setSelectedCities(values)}
                    placeholder={tApp('form.select-all-that-apply')}
                    label={tApp('referral-preferences.city')}
                    className="w-full sm:w-1/2"
                  />
                </>
              )}
            </fieldset>

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
              id="referralAvailibilityId"
              legend={tApp('referral-preferences.referral-availibility')}
              name="referralAvailibility"
              options={referralAvailibilityOptions}
              required
              errorMessage={tApp(extractValidationKey(formErrors?.availableForReferralInd))}
              helpMessagePrimary={tApp('referral-preferences.referral-availibility-help-message-primary')}
            />
            <InputRadios
              id="alternateOpportunityId"
              legend={tApp('referral-preferences.alternate-opportunity')}
              name="alternateOpportunity"
              options={alternateOpportunityOptions}
              required
              errorMessage={tApp(extractValidationKey(formErrors?.interestedInAlternationInd))}
              helpMessagePrimary={
                <Collapsible summary={tApp('referral-preferences.what-is-alternation')}>
                  {tApp('referral-preferences.alternation-description-text')}
                </Collapsible>
              }
            />
            <InputCheckboxes
              id="employmentOpportunityIds"
              errorMessage={tApp(extractValidationKey(formErrors?.employmentOpportunityIds))}
              legend={tApp('referral-preferences.employment-tenure')}
              name="employmentOpportunityIds"
              options={employmentOpportunityOptions}
              helpMessagePrimary={tApp('form.select-all-that-apply')}
              required
            />

            <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
              <Button name="action" variant="primary" id="save-button">
                {tApp('form.save')}
              </Button>
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
