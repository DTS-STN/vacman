import { useState } from 'react';

import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/referral-preferences';

import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { Collapsible } from '~/components/collapsible';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputCheckboxes } from '~/components/input-checkboxes';
import { InputRadios } from '~/components/input-radios';
import type { InputRadiosProps } from '~/components/input-radios';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { refferralPreferencesSchema } from '~/routes/employee/profile/validation.server';
import { handle as parentHandle } from '~/routes/layout';
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
  // Since parent layout ensures authentication, we can safely cast the session
  const formData = await request.formData();
  const parseResult = v.safeParse(refferralPreferencesSchema, {
    languageReferralTypes: formData.getAll('languageReferralTypes').map(String),
    classification: formData.getAll('classification').map(String),
    workLocations: formData.getAll('workLocations').map(String),
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

  throw i18nRedirect('routes/employee/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  // Since parent layout ensures authentication, we can safely cast the session
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguageReferralTypes = await getLanguageReferralTypeService().getAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().getAllLocalized(lang);
  return {
    documentTitle: t('app:referral-preferences.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      languageReferralTypes: undefined as string[] | undefined,
      classification: undefined as string[] | undefined,
      workLocations: undefined as string[] | undefined,
      referralAvailibility: undefined as boolean | undefined,
      alternateOpportunity: undefined as boolean | undefined,
      employmentTenures: undefined as string[] | undefined,
    },
    localizedLanguageReferralTypes: localizedLanguageReferralTypes.unwrap(),
    localizedEmploymentTenures: localizedEmploymentTenures.unwrap(),
  };
}

export default function PersonalDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  const [referralAvailibility, setReferralAvailibility] = useState(loaderData.defaultValues.referralAvailibility);
  const [alternateOpportunity, setAlternateOpportunity] = useState(loaderData.defaultValues.alternateOpportunity);

  const languageReferralTypeOptions = loaderData.localizedLanguageReferralTypes.map((langReferral) => ({
    value: langReferral.id,
    children: langReferral.name,
    defaultChecked: loaderData.defaultValues.languageReferralTypes?.includes(langReferral.id) ?? false,
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
  const employmentTenureOptions = loaderData.localizedEmploymentTenures.map((employmentTenures) => ({
    value: employmentTenures.id,
    children: employmentTenures.name,
    defaultChecked: loaderData.defaultValues.employmentTenures?.includes(employmentTenures.id) ?? false,
  }));

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/profile/index.tsx" id="back-button">
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
                <ButtonLink file="routes/employee/profile/index.tsx" id="cancel-button" variant="alternative">
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
