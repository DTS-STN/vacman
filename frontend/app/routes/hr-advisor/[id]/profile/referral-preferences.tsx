import { useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from '../profile/+types/referral-preferences';

import type { Profile } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
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
import { FormErrorSummary } from '~/components/error-summary';
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
import { refferralPreferencesSchema } from '~/routes/employee/profile/validation.server';
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
    languageReferralTypeIds: formData.getAll('languageReferralTypes').map(String),
    classificationIds: formData.getAll('classifications').map(String),
    workLocationProvince: formString(formData.get('workLocationProvince')),
    workLocationCitiesIds: formData.getAll('workLocationCities').map(String),
    availableForReferralInd: formData.get('referralAvailibility')
      ? formData.get('referralAvailibility') === REQUIRE_OPTIONS.yes
      : undefined,
    interestedInAlternationInd: formData.get('alternateOpportunity')
      ? formData.get('alternateOpportunity') === REQUIRE_OPTIONS.yes
      : undefined,
    employmentTenureIds: formData.getAll('employmentTenures').map(String),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof refferralPreferencesSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const updateResult = await getProfileService().updateReferralPreferences(currentUserId, parseResult.output);

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
  // Since parent layout ensures authentication, we can safely cast the session
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypesResult = await getLanguageReferralTypeService().listAllLocalized(lang);
  const localizedClassifications = await getClassificationService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedProvinces = await getProvinceService().listAllLocalized(lang);
  const localizedCities = await getCityService().listAllLocalized(lang);
  const profileData: Profile = profileResult.unwrap();

  const cityResult =
    profileData.referralPreferences.workLocationCitiesIds?.[0] &&
    (await getCityService().findLocalizedById(profileData.referralPreferences.workLocationCitiesIds[0], lang)); //get the province from first city only to avoid validation error on province
  const city = cityResult && cityResult.isSome() ? cityResult.unwrap() : undefined;

  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      languageReferralTypeIds: profileData.referralPreferences.languageReferralTypeIds,
      classificationIds: profileData.referralPreferences.classificationIds,
      workLocationProvince: city?.province.id,
      workLocationCitiesIds: profileData.referralPreferences.workLocationCitiesIds,
      availableForReferralInd: profileData.referralPreferences.availableForReferralInd,
      interestedInAlternationInd: profileData.referralPreferences.interestedInAlternationInd,
      employmentTenureIds: profileData.referralPreferences.employmentTenureIds,
    },
    languageReferralTypes: localizedLanguageReferralTypesResult,
    classifications: localizedClassifications,
    employmentTenures: localizedEmploymentTenures,
    provinces: localizedProvinces,
    cities: localizedCities,
  };
}

export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  const [referralAvailibility, setReferralAvailibility] = useState(loaderData.defaultValues.availableForReferralInd);
  const [alternateOpportunity, setAlternateOpportunity] = useState(loaderData.defaultValues.interestedInAlternationInd);
  const [selectedClassifications, setSelectedClassifications] = useState(loaderData.defaultValues.classificationIds);
  const [selectedCities, setSelectedCities] = useState(loaderData.defaultValues.workLocationCitiesIds);
  const [province, setProvince] = useState(loaderData.defaultValues.workLocationProvince);
  const [srAnnouncement, setSrAnnouncement] = useState(''); //screen reader announcement

  const languageReferralTypeOptions = loaderData.languageReferralTypes.map((langReferral) => ({
    value: String(langReferral.id),
    children: langReferral.name,
    defaultChecked: loaderData.defaultValues.languageReferralTypeIds?.includes(langReferral.id) ?? false,
  }));
  const classificationOptions = loaderData.classifications.map((classification) => ({
    value: String(classification.id),
    label: classification.name,
  }));
  const provinceOptions = [{ id: 'select-option', name: '' }, ...loaderData.provinces].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('app:form.select-option') : name,
  }));
  const cityOptions = loaderData.cities
    .filter((c) => String(c.province.id) === province)
    .map((city) => ({
      value: String(city.id),
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
    value: String(employmentTenures.id),
    children: employmentTenures.name,
    defaultChecked: loaderData.defaultValues.employmentTenureIds?.includes(employmentTenures.id) ?? false,
  }));

  // Choice tags for classification
  const classificationChoiceTags: ChoiceTag[] = (selectedClassifications ?? [])
    .map((classification) => {
      const selectedC = loaderData.classifications.find((c) => c.id === classification);
      return { label: selectedC?.name ?? classification, name: 'classification', value: classification };
    })
    .toSorted((a, b) => a.label.localeCompare(b.label));

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
  const citiesChoiceTags: ChoiceTag[] = (selectedCities ?? []).map((city) => {
    const selectedC = loaderData.cities.find((c) => String(c.id) === city);
    return { label: selectedC?.name ?? city, name: 'city', value: city, group: selectedC?.province.name };
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

  const handleOnClearCityGroup = (groupName: string) => {
    setSrAnnouncement(t('gcweb:choice-tag.clear-group-label', { items: 'cities', groupName }));
    setSelectedCities((prev) =>
      prev?.filter((cityId) => {
        const city = loaderData.cities.find((c) => String(c.id) === cityId);
        return city?.province.name !== groupName;
      }),
    );
  };

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl">{t('app:referral-preferences.page-title')}</h1>
        <FormErrorSummary>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputCheckboxes
                id="languageReferralTypesId"
                errorMessage={t(extractValidationKey(errors?.languageReferralTypeIds))}
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
                errorMessage={t(extractValidationKey(errors?.classificationIds))}
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
                      errorMessage={t(extractValidationKey(errors?.workLocationCitiesIds))}
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
                  onClearGroup={handleOnClearCityGroup}
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
                errorMessage={t(extractValidationKey(errors?.availableForReferralInd))}
                helpMessagePrimary={t('app:referral-preferences.referral-availibility-help-message-primary')}
              />
              <InputRadios
                id="alternateOpportunityId"
                legend={t('app:referral-preferences.alternate-opportunity')}
                name="alternateOpportunity"
                options={alternateOpportunityOptions}
                required
                errorMessage={t(extractValidationKey(errors?.interestedInAlternationInd))}
                helpMessagePrimary={
                  <Collapsible summary={t('app:referral-preferences.what-is-alternation')}>
                    {t('app:referral-preferences.alternation-description-text')}
                  </Collapsible>
                }
              />
              <InputCheckboxes
                id="employmentTenuresId"
                errorMessage={t(extractValidationKey(errors?.employmentTenureIds))}
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
