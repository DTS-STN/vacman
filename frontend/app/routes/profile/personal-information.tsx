import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/personal-information';

import { getEducationLevelService } from '~/.server/domain/services/education-level-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { requireAllRoles } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputPhoneField } from '~/components/input-phone-field';
import { InputRadios } from '~/components/input-radios';
import { InputTextarea } from '~/components/input-textarea';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { personalInformationSchema } from '~/routes/profile/validation.server';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);

  const formData = await request.formData();
  const parseResult = v.safeParse(personalInformationSchema, {
    preferredLanguage: formString(formData.get('preferredLanguage')),
    personalEmail: formString(formData.get('personalEmail')),
    workPhone: formString(formData.get('workPhone')),
    workPhoneExtension: formString(formData.get('workPhoneExtension')),
    personalPhone: formString(formData.get('personalPhone')),
    education: formString(formData.get('education')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof personalInformationSchema>(parseResult.issues).nested },
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
    documentTitle: t('app:personalInformation.pageTitle'),
    defaultValues: {
      //TODO: Replace with actual values
      preferredLanguage: undefined as string | undefined,
      workEmail: context.session.authState.idTokenClaims.email,
      personalEmail: undefined,
      workPhone: undefined,
      workPhoneExtension: undefined,
      personalPhone: undefined,
      education: undefined as string | undefined,
    },
    languagesOfCorrespondence: await getLanguageForCorrespondenceService().getLocalizedLanguageOfCorrespondence(lang),
    education: await getEducationLevelService().getLocalizedEducationLevels(lang),
  };
}

export default function PersonalInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;
  const languageOptions = loaderData.languagesOfCorrespondence.map(({ id, name }) => ({
    value: id,
    children: name,
    defaultChecked: id === loaderData.defaultValues.preferredLanguage,
  }));
  const educationOptions = loaderData.education.map(({ id, name }) => ({
    value: id,
    children: name,
    defaultChecked: id === loaderData.defaultValues.education,
  }));
  return (
    <>
      <InlineLink className="mt-6 block" file="routes/profile/index.tsx" id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:personalInformation.pageTitle')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputRadios
                id="preferred-language"
                name="preferredLanguage"
                legend={t('app:personalInformation.preferredLanguage')}
                options={languageOptions}
                errorMessage={t(extractValidationKey(errors?.preferredLanguage))}
                required
              />
              <InputField
                disabled
                className="w-full"
                id="work-email"
                name="workEmail"
                label={t('app:personalInformation.workEmail')}
                defaultValue={loaderData.defaultValues.workEmail}
                required
              />
              <InputField
                className="w-full"
                id="personal-email"
                name="personalEmail"
                label={t('app:personalInformation.personalEmail')}
                defaultValue={loaderData.defaultValues.personalEmail}
                errorMessage={t(extractValidationKey(errors?.personalEmail))}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputPhoneField
                  id="work-phone"
                  name="workPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  label={t('app:personalInformation.workPhone')}
                  defaultValue={loaderData.defaultValues.workPhone}
                  errorMessage={t(extractValidationKey(errors?.workPhone))}
                  helpMessagePrimary={t('app:personalInformation.workPhoneHelpMessagePrimary')}
                  required
                />
                <InputField
                  id="work-phone-extension"
                  name="workPhoneExtension"
                  className="w-20"
                  label={t('app:personalInformation.workPhoneExtension')}
                  defaultValue={loaderData.defaultValues.workPhoneExtension}
                  errorMessage={t(extractValidationKey(errors?.workPhoneExtension))}
                  helpMessagePrimary={t('app:personalInformation.workPhoneExtensionHelpMessagePrimary')}
                  type="number"
                />
              </div>
              <InputPhoneField
                id="personal-phone"
                name="personalPhone"
                type="tel"
                inputMode="tel"
                label={t('app:personalInformation.personalPhone')}
                defaultValue={loaderData.defaultValues.personalPhone}
                errorMessage={t(extractValidationKey(errors?.personalPhone))}
                helpMessagePrimary={t('app:personalInformation.personalPhoneHelpMessagePrimary')}
                required
              />
              <InputRadios
                id="education"
                name="education"
                legend={t('app:personalInformation.education')}
                options={educationOptions}
                errorMessage={t(extractValidationKey(errors?.education))}
                required
              />
              <InputTextarea
                id="additional-information"
                className="w-full"
                label={t('app:personalInformation.additionalInformation')}
                name="additionalInformation"
                helpMessage={t('app:personalInformation.additionalInfoHelpMessage')}
                maxLength={100}
              />
              <Button className="px-12" name="action" variant="primary" id="save-button">
                {t('app:form.save')}
              </Button>
            </div>
          </Form>
        </ActionDataErrorSummary>
      </div>
    </>
  );
}
