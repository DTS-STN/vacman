import { useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedCity,
  LocalizedClassification,
  LocalizedLanguageReferralType,
  LocalizedProvince,
  Profile,
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
import { PageTitle } from '~/components/page-title';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/profile/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface ReferralPreferencesFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<Profile> | undefined;
  preferredProvince?: number;
  formErrors?: Errors;
  languageReferralTypes: readonly LocalizedLanguageReferralType[];
  classifications: readonly LocalizedClassification[];
  provinces: readonly LocalizedProvince[];
  cities: readonly LocalizedCity[];
  params: Params;
}

export function ReferralPreferencesForm({
  cancelLink,
  formValues,
  preferredProvince,
  formErrors,
  languageReferralTypes,
  classifications,
  provinces,
  cities,
  params,
}: ReferralPreferencesFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const [selectedClassifications, setSelectedClassifications] = useState(
    formValues?.preferredClassifications?.map(({ id }) => id.toString()) ?? [],
  );
  const [selectedCities, setSelectedCities] = useState(formValues?.preferredCities?.map(({ id }) => id.toString()) ?? []);
  const [province, setProvince] = useState(preferredProvince?.toString());
  const [srAnnouncement, setSrAnnouncement] = useState(''); //screen reader announcement

  const languageReferralTypeOptions = languageReferralTypes.map((langReferral) => ({
    value: String(langReferral.id),
    children: langReferral.name,
    defaultChecked: !!formValues?.preferredLanguages?.find((p) => p.id === langReferral.id),
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
      defaultChecked: formValues?.isAvailableForReferral === true,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: formValues?.isAvailableForReferral === false,
    },
  ];
  const alternateOpportunityOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: formValues?.isInterestedInAlternation === true,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: formValues?.isInterestedInAlternation === false,
    },
  ];

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

  const handleSelectAllCities = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSrAnnouncement(tApp('referral-preferences.select-all-sr'));
    setSelectedCities(cities.map(({ id }) => id.toString()));
    setProvince((provinces.at(0)?.id ?? 0).toString());
  };

  return (
    <>
      <PageTitle className="after:w-14">{tApp('referral-preferences.page-title')}</PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputCheckboxes
              id="preferred-languages"
              errorMessage={tApp(extractValidationKey(formErrors?.preferredLanguages))}
              legend={tApp('referral-preferences.language-referral-type')}
              name="preferredLanguages"
              options={languageReferralTypeOptions}
              helpMessagePrimary={tApp('form.select-all-that-apply')}
              required
            />
            <InputMultiSelect
              id="preferred-classifications"
              name="preferredClassifications"
              legend={tApp('referral-preferences.classification')}
              options={classificationOptions}
              value={selectedClassifications}
              onChange={(values) => setSelectedClassifications(values)}
              placeholder={tApp('form.select-all-that-apply')}
              helpMessage={tApp('referral-preferences.classification-group-help-message-primary')}
              errorMessage={tApp(extractValidationKey(formErrors?.preferredClassifications))}
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
              <InputHelp id="workLocationHelpMessage">{tApp('referral-preferences.select-work-locations')}</InputHelp>
              <Button variant="primary" onClick={handleSelectAllCities}>
                {tApp('referral-preferences.select-all')}
              </Button>
              <InputSelect
                ariaDescribedbyId="workLocationHelpMessage"
                className="w-full sm:w-1/2"
                id="preferred-province"
                name="preferredProvince"
                label={tApp('referral-preferences.province')}
                options={provinceOptions}
                errorMessage={tApp(extractValidationKey(formErrors?.preferredProvince))}
                value={province ?? ''}
                onChange={({ target }) => setProvince(target.value)}
                required
              />
              {province && (
                <>
                  <InputMultiSelect
                    ariaDescribedbyId="workLocationHelpMessage"
                    id="preferred-cities"
                    name="preferredCities"
                    errorMessage={tApp(extractValidationKey(formErrors?.preferredCities))}
                    options={cityOptions}
                    value={selectedCities}
                    onChange={(values) => setSelectedCities(values)}
                    placeholder={tApp('form.select-all-that-apply')}
                    legend={tApp('referral-preferences.city')}
                    className="w-full sm:w-1/2"
                    required
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
              id="is-available-for-referral"
              legend={tApp('referral-preferences.referral-availibility')}
              name="isAvailableForReferral"
              options={referralAvailibilityOptions}
              required
              errorMessage={tApp(extractValidationKey(formErrors?.isAvailableForReferral))}
              helpMessagePrimary={tApp('referral-preferences.referral-availibility-help-message-primary')}
            />
            <InputRadios
              id="is-interested-in-alternation"
              legend={tApp('referral-preferences.alternate-opportunity')}
              name="isInterestedInAlternation"
              options={alternateOpportunityOptions}
              required
              errorMessage={tApp(extractValidationKey(formErrors?.isInterestedInAlternation))}
              helpMessagePrimary={
                <Collapsible summary={tApp('referral-preferences.what-is-alternation')}>
                  <p>{tApp('referral-preferences.alternation-description-text-para-1')}</p>
                  <p>{tApp('referral-preferences.alternation-description-text-para-2')}</p>
                </Collapsible>
              }
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
