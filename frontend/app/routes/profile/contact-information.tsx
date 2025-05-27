import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/contact-information';

import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputPhoneField } from '~/components/input-phone-field';
import { InputRadios } from '~/components/input-radios';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace, 'protected'],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const contactInformationSchema = v.object({
    preferredLanguage: v.lazy(() =>
      v.optional(
        v.picklist(
          getLanguagesOfCorrespondence().map(({ id }) => id),
          'protected:contact-information.errors.preferred-language',
        ),
      ),
    ),
    personalEmail: v.optional(v.pipe(v.string(), v.trim(), v.email('protected:contact-information.errors.personal-email'))),
    workPhone: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('protected:contact-information.errors.work-phone'),
        v.custom((val) => isValidPhoneNumber(val as string), 'protected:contact-information.errors.work-phone'),
        v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
      ),
    ),
    personalPhone: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('protected:contact-information.errors.personal-phone'),
        v.custom((val) => isValidPhoneNumber(val as string), 'protected:contact-information.errors.personal-phone'),
        v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
      ),
    ),
  });

  const formData = await request.formData();
  const parseResult = v.safeParse(contactInformationSchema, {
    preferredLanguage: formString(formData.get('preferredLanguage')),
    personalEmail: formString(formData.get('personalEmail')),
    workPhone: formString(formData.get('workPhone')),
    personalPhone: formString(formData.get('personalPhone')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof contactInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data & work email after validation, workEmail: context.session.authState.idTokenClaims.email

  throw i18nRedirect('routes/profile/index.tsx', request);
}

export async function loader({ context, request }: Route.LoaderArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  return {
    documentTitle: t('protected:contact-information.page-title'),
    defaultValues: {
      //TODO: Replace with actual values
      preferredLanguage: undefined as string | undefined,
      workEmail: context.session.authState.idTokenClaims.email,
      personalEmail: undefined,
      workPhone: undefined,
      personalPhone: undefined,
    },
    languagesOfCorrespondence: getLocalizedLanguageOfCorrespondence(lang),
  };
}

export default function ContactInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;
  const languageOptions = loaderData.languagesOfCorrespondence.map(({ id, name }) => ({
    value: id,
    children: name,
    defaultChecked: id === loaderData.defaultValues.preferredLanguage,
  }));
  return (
    <>
      <InlineLink className="mt-6 block" file="routes/profile/index.tsx" id="back-button">
        {`<\u0020${t('protected:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('protected:contact-information.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputRadios
                id="preferred-language"
                name="preferredLanguage"
                legend={t('protected:contact-information.preferred-language')}
                options={languageOptions}
                errorMessage={t(extractValidationKey(errors?.preferredLanguage))}
              />
              <InputField
                disabled
                className="w-full"
                id="work-email"
                name="workEmail"
                label={t('protected:contact-information.work-email')}
                defaultValue={loaderData.defaultValues.workEmail}
              />
              <InputField
                className="w-full"
                id="personal-email"
                name="personalEmail"
                label={t('protected:contact-information.personal-email')}
                defaultValue={loaderData.defaultValues.personalEmail}
                errorMessage={t(extractValidationKey(errors?.personalEmail))}
              />
              <InputPhoneField
                id="work-phone"
                name="workPhone"
                label={t('protected:contact-information.work-phone')}
                defaultValue={loaderData.defaultValues.workPhone}
                errorMessage={t(extractValidationKey(errors?.workPhone))}
              />
              <InputPhoneField
                id="personal-phone"
                name="personalPhone"
                label={t('protected:contact-information.personal-phone')}
                defaultValue={loaderData.defaultValues.personalPhone}
                errorMessage={t(extractValidationKey(errors?.personalPhone))}
              />
              <Button className="px-12" name="action" variant="primary" id="save-button">
                {t('protected:form.save')}
              </Button>
            </div>
          </Form>
        </ActionDataErrorSummary>
      </div>
    </>
  );
}

//TODO: Replace with actual functions
function getLanguagesOfCorrespondence() {
  return [
    { id: 'l1', name: 'English' },
    { id: 'l2', name: 'French' },
  ];
}
function getLocalizedLanguageOfCorrespondence(lang: Language) {
  if (lang === 'en')
    return [
      { id: 'l1', name: 'English' },
      { id: 'l2', name: 'French' },
    ];
  return [
    { id: 'l1', name: 'Anglais' },
    { id: 'l2', name: 'Français' },
  ];
}
