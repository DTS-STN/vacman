import { useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/referral-preferences';

import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProvinceService } from '~/.server/domain/services/province-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import type {
  ChoiceTag,
  DeleteEventHandler as ChoiceTagDeleteEventHandler,
  ClearAllEventHandler as ChoiceTagClearAllEventHandler,
} from '~/components/choice-tags';
import { ChoiceTags } from '~/components/choice-tags';
import { Collapsible } from '~/components/collapsible';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputCheckboxes } from '~/components/input-checkboxes';
import { InputHelp } from '~/components/input-help';
import { InputLegend } from '~/components/input-legend';
import { InputMultiSelect } from '~/components/input-multiselect';
import { InputRadios } from '~/components/input-radios';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { refferralPreferencesSchema } from '~/routes/employee/[id]/profile/validation.server';
import { handle as parentHandle } from '~/routes/layout';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

const REQUIRE_OPTIONS = {
  yes: 'Yes', //
  no: 'No',
} as const;

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
  const parseResult = v.safeParse(refferralPreferencesSchema, {
    languageReferralTypes: formData.getAll('languageReferralTypes').map(String),
    classifications: formData.getAll('classifications').map(String),
    workLocationProvince: formString(formData.get('workLocationProvince')),
    workLocationCities: formData.getAll('workLocationCities').map(String),
    referralAvailibility: formData.get('referralAvailibility')
      ? formData.get('referralAvailibility') === REQUIRE_OPTIONS.yes
      : undefined,
    alternateOpportunity: formData.get('alternateOpportunity')
      ? formData.get('alternateOpportunity') === REQUIRE_OPTIONS.yes
      : undefined,
    employmentTenures: formData.getAll('employmentTenures').map(String),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof refferralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data

  return i18nRedirect('routes/employee/[id]/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().getAllLocalized(lang);
  const classifications = await getClassificationService().getAll();
  const localizedProvinces = await getProvinceService().getAllLocalized(lang);
  const localizedCities = await getCityService().getAllLocalized(lang);

  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      languageReferralTypes: undefined as string[] | undefined,
      classification: undefined as string[] | undefined,
      workLocationCities: undefined as string[] | undefined,
      referralAvailibility: undefined as boolean | undefined,
      alternateOpportunity: undefined as boolean | undefined,
      employmentTenures: undefined as string[] | undefined,
    },
    languageReferralTypes: localizedLanguageReferralTypesResult,
    employmentTenures: localizedEmploymentTenures.unwrap(),
    classifications: classifications.unwrap(),
    provinces: localizedProvinces.unwrap(),
    cities: localizedCities.unwrap(),
  };
}

export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  const [referralAvailibility, setReferralAvailibility] = useState(loaderData.defaultValues.referralAvailibility);
  const [alternateOpportunity, setAlternateOpportunity] = useState(loaderData.defaultValues.alternateOpportunity);
  const [selectedClassifications, setSelectedClassifications] = useState(loaderData.defaultValues.classification);
  const [selectedCities, setSelectedCities] = useState(loaderData.defaultValues.workLocationCities);
  const [province, setProvince] = useState('');
  const [srAnnouncement, setSrAnnouncement] = useState(''); //screen reader announcement

  const languageReferralTypeOptions = loaderData.languageReferralTypes.map((langReferral) => ({
    value: String(langReferral.id),
    children: langReferral.name,
    defaultChecked: loaderData.defaultValues.languageReferralTypes?.includes(langReferral.id) ?? false,
  }));
  const classificationOptions = loaderData.classifications.map((classification) => ({
    value: classification.id,
    label: classification.name,
  }));
  const provinceOptions = [{ id: 'select-option', name: '' }, ...loaderData.provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : id,
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));
  const cityOptions = loaderData.cities
    .filter((c) => c.province.id === province)
    .map((city) => ({
      value: city.id,
      label: city.name,
      group: city.province.name,
    }));
  const referralAvailibilityOptions: InputRadiosProps['options'] = [
    {
      children: t('gcweb:input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: referralAvailibility === true,
      onChange: ({ target }) => setReferralAvailibility(target.value === REQUIRE_OPTIONS.yes),
    },
    {
      children: t('gcweb:input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: referralAvailibility === false,
      onChange: ({ target }) => setReferralAvailibility(target.value === REQUIRE_OPTIONS.yes),
    },
  ];
  const alternateOpportunityOptions: InputRadiosProps['options'] = [
    {
      children: t('gcweb:input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: alternateOpportunity === true,
      onChange: ({ target }) => setAlternateOpportunity(target.value === REQUIRE_OPTIONS.yes),
    },
    {
      children: t('gcweb:input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: alternateOpportunity === false,
      onChange: ({ target }) => setAlternateOpportunity(target.value === REQUIRE_OPTIONS.yes),
    },
  ];
  const employmentTenureOptions = loaderData.employmentTenures.map((employmentTenures) => ({
    value: employmentTenures.id,
    children: employmentTenures.name,
    defaultChecked: loaderData.defaultValues.employmentTenures?.includes(employmentTenures.id) ?? false,
  }));

  // Choice tags for classification
  const classificationChoiceTags: ChoiceTag[] = [];

  selectedClassifications?.forEach((classification) => {
    const selectedC = loaderData.classifications.find((c) => c.id === classification);
    classificationChoiceTags.push({ label: selectedC?.name ?? classification, name: 'classification', value: classification });
  });

  /**
   * Removes a classification from `classification group(s) and level(s)` and announces the removal to screen readers.
   */
  const handleOnDeleteClassificationTag: ChoiceTagDeleteEventHandler = (name, label, value) => {
    setSrAnnouncement(t('gcweb:choice-tag.removed-choice-tag-sr-message', { item: name, choice: label }));
    setSelectedClassifications((prev) => prev?.filter((classificationId) => classificationId !== value));
  };

  const handleOnClearAllClassifications: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(t('gcweb:choice-tag.clear-all-sr-message', { item: 'classifications' }));
    setSelectedClassifications([]);
  };

  // Choice tags for cities
  const citiesChoiceTags: ChoiceTag[] = [];

  selectedCities?.forEach((city) => {
    const selectedC = loaderData.cities.find((c) => c.id === city);
    citiesChoiceTags.push({ label: selectedC?.name ?? city, name: 'city', value: city, group: selectedC?.province.name });
  });

  /**
   * Removes a city from `work locations` and announces the removal to screen readers.
   */
  const handleOnDeleteCityTag: ChoiceTagDeleteEventHandler = (name, label, value, group) => {
    setSrAnnouncement(
      t('gcweb:choice-tag.removed-choice-tag-sr-message', { item: name, choice: group ? group + ' - ' + label : label }),
    );
    setSelectedCities((prev) => prev?.filter((cityId) => cityId !== value));
  };

  const handleOnClearAllCities: ChoiceTagClearAllEventHandler = () => {
    setSrAnnouncement(t('gcweb:choice-tag.clear-all-sr-message', { item: 'cities' }));
    setSelectedCities([]);
  };

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/[id]/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">{t('app:referral-preferences.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputCheckboxes
                id="languageReferralTypesId"
                errorMessage={t(extractValidationKey(errors?.languageReferralTypes))}
                legend={t('app:referral-preferences.language-referral-type')}
                name="languageReferralTypes"
                options={languageReferralTypeOptions}
                helpMessagePrimary={t('app:form.select-all-that-apply')}
                required
              />
              <InputMultiSelect
                id="classificationsId"
                name="classifications"
                label={t('app:referral-preferences.classification')}
                options={classificationOptions}
                value={selectedClassifications ?? []}
                onChange={setSelectedClassifications}
                placeholder={t('app:form.select-all-that-apply')}
                helpMessage={t('app:referral-preferences.classification-group-help-message-primary')}
                errorMessage={t(extractValidationKey(errors?.classifications))}
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
                  {t('app:referral-preferences.work-location')}
                </InputLegend>
                <InputHelp id="workLocationHelpMessage">{t('app:form.select-all-that-apply')}</InputHelp>
                <InputSelect
                  className="w-full sm:w-1/2"
                  id="workLocationProvinceId"
                  name="workLocationProvince"
                  label={t('app:referral-preferences.province')}
                  options={provinceOptions}
                  errorMessage={t(extractValidationKey(errors?.workLocationProvince))}
                  value={province}
                  onChange={({ target }) => setProvince(target.value)}
                />
                {province && (
                  <>
                    <InputMultiSelect
                      id="workLocationCitiesId"
                      name="workLocationCities"
                      errorMessage={t(extractValidationKey(errors?.workLocationCities))}
                      options={cityOptions}
                      value={selectedCities ?? []}
                      onChange={setSelectedCities}
                      placeholder={t('app:form.select-all-that-apply')}
                      label={t('app:referral-preferences.city')}
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
                />
              )}

              <span aria-live="polite" aria-atomic="true" className="sr-only">
                {srAnnouncement}
              </span>

              <InputRadios
                id="referralAvailibilityId"
                legend={t('app:referral-preferences.referral-availibility')}
                name="referralAvailibility"
                options={referralAvailibilityOptions}
                required
                errorMessage={t(extractValidationKey(errors?.referralAvailibility))}
                helpMessagePrimary={t('app:referral-preferences.referral-availibility-help-message-primary')}
              />
              <InputRadios
                id="alternateOpportunityId"
                legend={t('app:referral-preferences.alternate-opportunity')}
                name="alternateOpportunity"
                options={alternateOpportunityOptions}
                required
                errorMessage={t(extractValidationKey(errors?.alternateOpportunity))}
                helpMessagePrimary={
                  <Collapsible summary={t('app:referral-preferences.what-is-alternation')}>
                    {t('app:referral-preferences.alternation-description-text')}
                  </Collapsible>
                }
              />
              <InputCheckboxes
                id="employmentTenuresId"
                errorMessage={t(extractValidationKey(errors?.employmentTenures))}
                legend={t('app:referral-preferences.employment-tenure')}
                name="employmentTenures"
                options={employmentTenureOptions}
                helpMessagePrimary={t('app:form.select-all-that-apply')}
                required
              />

              <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
                <Button name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink
                  file="routes/employee/[id]/profile/index.tsx"
                  params={params}
                  id="cancel-button"
                  variant="alternative"
                >
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
