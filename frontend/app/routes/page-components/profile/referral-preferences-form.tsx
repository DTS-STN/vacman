import { useState, useMemo } from 'react';
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
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import { useLanguage } from '~/hooks/use-language';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/profile/validation.server';
import { extractValidationKey, normalizeErrors } from '~/utils/validation-utils';

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
  isSubmitting?: boolean;
}

export function ReferralPreferencesForm({
  cancelLink,
  formValues,
  preferredProvince,
  formErrors: baseFormErrors,
  languageReferralTypes,
  classifications,
  provinces,
  cities,
  params,
  isSubmitting,
}: ReferralPreferencesFormProps): JSX.Element {
  const formErrors = normalizeErrors(baseFormErrors);
  const { currentLanguage } = useLanguage();
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

  const cityOptions = useMemo(
    () =>
      cities
        .filter((c) => c.provinceTerritory.id === Number(province))
        .map((city) => ({
          value: String(city.id),
          label: city.name,
          group: city.provinceTerritory.name,
        })),
    [cities, province],
  );

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
      const selectedClassification = classifications.find((c) => c.id === Number(classification));
      if (selectedClassification) {
        return {
          label: selectedClassification.name,
          name: tApp('referral-preferences.choice-tag.classification'),
          value: classification,
          invalid: false,
        };
      }
      const missingClassification = formValues?.preferredClassifications?.find((c) => c.id === Number(classification));
      if (missingClassification) {
        return {
          label: currentLanguage === 'en' ? missingClassification.nameEn : missingClassification.nameFr,
          name: tApp('referral-preferences.choice-tag.classification'),
          value: classification,
          invalid: true,
        };
      }
    })
    .filter((classification) => classification !== undefined)
    .toSorted((a, b) => String(a.label).localeCompare(String(b.label)));

  /**
   * Removes a classification from `classification group(s) and level(s)` and announces the removal to screen readers.
   */
  const handleOnDeleteClassificationTag: ChoiceTagDeleteEventHandler = (name, label, value) => {
    setSrAnnouncement(tGcweb('choice-tag.removed-choice-tag-sr-message', { item: name, choice: label }));
    setSelectedClassifications((prev) => prev.filter((classificationId) => classificationId !== value));
  };

  const handleOnClearAllClassifications: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(
      tGcweb('choice-tag.clear-all-sr-message', { item: tApp('referral-preferences.choice-tag.classifications') }),
    );
    setSelectedClassifications([]);
  };

  // Choice tags for cities
  const citiesChoiceTags: ChoiceTag[] = selectedCities
    .map((city) => {
      const selectedCity = cities.find((c) => c.id === Number(city));
      if (selectedCity) {
        return {
          label: selectedCity.name,
          name: tApp('referral-preferences.choice-tag.city'),
          value: city,
          group: selectedCity.provinceTerritory.name,
          invalid: false,
        };
      }
      const missingCity = formValues?.preferredCities?.find((c) => c.id === Number(city));
      if (missingCity) {
        return {
          label: currentLanguage === 'en' ? missingCity.nameEn : missingCity.nameFr,
          name: tApp('referral-preferences.choice-tag.city'),
          value: city,
          group: currentLanguage === 'en' ? missingCity.provinceTerritory.nameEn : missingCity.provinceTerritory.nameFr,
          invalid: true,
        };
      }
    })
    .filter((cityTag) => cityTag !== undefined);

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
    setSrAnnouncement(tGcweb('choice-tag.clear-all-sr-message', { item: tApp('referral-preferences.choice-tag.cities') }));
    setSelectedCities([]);
  };

  const handleOnClearCityGroup = (groupName: string) => {
    setSrAnnouncement(
      tGcweb('choice-tag.clear-group-sr-message', { items: tApp('referral-preferences.choice-tag.cities'), groupName }),
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
    setSrAnnouncement(tApp('referral-preferences.select-all-sr'));
    setSelectedCities(cities.map(({ id }) => id.toString()));
    setProvince((provinces.at(0)?.id ?? 0).toString());
  };

  const handleSelectAllCities = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const selectedP = provinces.find((p) => p.id === Number(province));
    setSrAnnouncement(tApp('referral-preferences.select-all-cities-sr', { province: selectedP?.name }));
    const selectedC = cities.filter((c) => c.provinceTerritory.id === Number(province));
    const newCityIds = selectedC.map(({ id }) => id.toString());
    setSelectedCities((prev) => [...new Set([...prev, ...newCityIds])]);
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
              errorMessage={tApp(extractValidationKey(formErrors?.preferredClassifications))}
              className="w-full"
              required
              helpMessage={
                <div className="space-y-2">
                  <p>{tApp('referral-preferences.classification-group-help-message-primary')}</p>
                  <Collapsible summary={tApp('referral-preferences.guidance-on-groups-and-levels')}>
                    <p>{tApp('referral-preferences.guidance-on-groups-and-levels-description')}</p>
                  </Collapsible>
                </div>
              }
            />

            {classificationChoiceTags.length > 0 && (
              <ChoiceTags
                choiceTags={classificationChoiceTags}
                onClearAll={handleOnClearAllClassifications}
                onDelete={handleOnDeleteClassificationTag}
              />
            )}

            <fieldset id="workLocationFieldset" aria-describedby="workLocationLegend" className="space-y-4">
              <InputLegend id="workLocationLegend" className="text-xl" required>
                {tApp('referral-preferences.work-location')}
              </InputLegend>
              <fieldset className="space-y-2" id="location-province-fieldset" aria-describedby="location-province-legend">
                <InputLegend id="location-province-legend" required>
                  {tApp('referral-preferences.province')}
                </InputLegend>
                <InputHelp id="workLocationHelpMessage">{tApp('referral-preferences.select-work-locations')}</InputHelp>
                <Button variant="primary" onClick={handleSelectAllLocations} aria-describedby="workLocationHelpMessage">
                  {tApp('referral-preferences.select-all')}
                </Button>
                <InputSelect
                  ariaDescribedbyId="workLocationHelpMessage"
                  className="w-full"
                  id="preferred-province"
                  name="preferredProvince"
                  label=""
                  options={provinceOptions}
                  errorMessage={tApp(extractValidationKey(formErrors?.preferredProvince))}
                  value={province ?? ''}
                  onChange={({ target }) => setProvince(target.value)}
                />
              </fieldset>
              {province && (
                <fieldset className="space-y-2" id="location-cities-fieldset" aria-describedby="location-cities-legend">
                  <InputLegend id="location-cities-legend" required>
                    {tApp('referral-preferences.city')}
                  </InputLegend>
                  <InputHelp id="selectCitiesLegend">{tApp('referral-preferences.select-all-cities-help message')}</InputHelp>
                  <Button variant="primary" onClick={handleSelectAllCities} aria-describedby="selectCitiesLegend">
                    {tApp('referral-preferences.select-all-cities')}
                  </Button>
                  <InputMultiSelect
                    ariaDescribedbyId="selectCitiesLegend"
                    id="preferred-cities"
                    name="preferredCities"
                    errorMessage={tApp(extractValidationKey(formErrors?.preferredCities))}
                    options={cityOptions}
                    value={selectedCities}
                    onChange={(values) => setSelectedCities(values)}
                    placeholder={tApp('form.select-all-that-apply')}
                    legend=""
                    className="w-full"
                  />
                </fieldset>
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
              displayAriaDescribedBy={false}
              helpMessagePrimary={
                <div className="space-y-2">
                  <p>{tApp('referral-preferences.alternate-opportunity-help-message')}</p>
                  <Collapsible summary={tApp('referral-preferences.what-is-alternation')}>
                    <p>{tApp('referral-preferences.alternation-description-text-para-1')}</p>
                    <p>{tApp('referral-preferences.alternation-description-text-para-2')}</p>
                  </Collapsible>
                </div>
              }
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
