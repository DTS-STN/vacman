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
import { ButtonLink } from '~/components/button-link';
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
    documentTitle: t('app:personal-information.page-title'),
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
        <h1 className="my-5 text-3xl font-semibold">{t('app:personal-information.page-title')}</h1>
        <ActionDataErrorSummary actionData>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputRadios
                id="preferred-language"
                name="preferredLanguage"
                legend={t('app:personal-information.preferred-language')}
                options={languageOptions}
                errorMessage={t(extractValidationKey(errors?.preferredLanguage))}
                required
              />
              <InputField
                disabled
                className="w-full"
                id="work-email"
                name="workEmail"
                label={t('app:personal-information.work-email')}
                defaultValue={loaderData.defaultValues.workEmail}
                required
              />
              <InputField
                className="w-full"
                id="personal-email"
                name="personalEmail"
                label={t('app:personal-information.personal-email')}
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
                  label={t('app:personal-information.work-phone')}
                  defaultValue={loaderData.defaultValues.workPhone}
                  errorMessage={t(extractValidationKey(errors?.workPhone))}
                  helpMessagePrimary={t('app:personal-information.work-phone-help-message-primary')}
                  required
                />
                <InputField
                  id="work-phone-extension"
                  name="workPhoneExtension"
                  className="w-20"
                  label={t('app:personal-information.work-phone-extension')}
                  defaultValue={loaderData.defaultValues.workPhoneExtension}
                  errorMessage={t(extractValidationKey(errors?.workPhoneExtension))}
                  helpMessagePrimary={t('app:personal-information.work-phone-extension-help-message-primary')}
                  type="number"
                />
              </div>
              <InputPhoneField
                id="personal-phone"
                name="personalPhone"
                type="tel"
                inputMode="tel"
                label={t('app:personal-information.personal-phone')}
                defaultValue={loaderData.defaultValues.personalPhone}
                errorMessage={t(extractValidationKey(errors?.personalPhone))}
                helpMessagePrimary={t('app:personal-information.personal-phone-help-message-primary')}
                required
              />
              <InputRadios
                id="education"
                name="education"
                legend={t('app:personal-information.education')}
                options={educationOptions}
                errorMessage={t(extractValidationKey(errors?.education))}
                required
              />
              <InputTextarea
                id="additional-information"
                className="w-full"
                label={t('app:personal-information.additional-information')}
                name="additionalInformation"
                helpMessage={t('app:personal-information.additional-info-help-message')}
                maxLength={100}
              />
              <div className="mt-8 grid grid-cols-1 place-items-start gap-6">
                <Button className="w-30" name="action" variant="primary" id="save-button">
                  {t('app:form.save')}
                </Button>
                <ButtonLink className="w-30" file="routes/profile/index.tsx" id="cancel-button" variant="alternative">
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
