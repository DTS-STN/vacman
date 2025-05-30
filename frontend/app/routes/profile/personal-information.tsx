import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';
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
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAllRoles(context.session, new URL(request.url), ['employee']);
  const languagesOfCorrespondence = await getLanguageForCorrespondenceService().getLanguagesOfCorrespondence();
  const educationLevels = await getEducationLevelService().getEducationLevels();

  const personalInformationSchema = v.object({
    preferredLanguage: v.lazy(() =>
      v.optional(
        v.picklist(
          languagesOfCorrespondence.map(({ id }) => id),
          'app:personal-information.errors.preferred-language-required',
        ),
      ),
    ),
    personalEmail: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('app:personal-information.errors.personal-email-required'),
        v.email('app:personal-information.errors.personal-email-invalid'),
      ),
    ),
    workPhone: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('app:personal-information.errors.work-phone-required'),
        v.custom((val) => isValidPhoneNumber(val as string), 'app:personal-information.errors.work-phone-invalid'),
        v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
      ),
    ),
    personalPhone: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.nonEmpty('app:personal-information.errors.personal-phone-required'),
        v.custom((val) => isValidPhoneNumber(val as string), 'app:personal-information.errors.personal-phone-invalid'),
        v.transform((val) => parsePhoneNumberWithError(val, 'CA').formatInternational().replace(/ /g, '')),
      ),
    ),
    education: v.optional(
      v.picklist(
        educationLevels.map(({ id }) => id),
        'app:personal-information.errors.education-required',
      ),
    ),
  });

  const formData = await request.formData();
  const parseResult = v.safeParse(personalInformationSchema, {
    preferredLanguage: formString(formData.get('preferredLanguage')),
    personalEmail: formString(formData.get('personalEmail')),
    workPhone: formString(formData.get('workPhone')),
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
        {`<\u0020${t('app:profile.back')}`}
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
              <InputPhoneField
                id="work-phone"
                name="workPhone"
                label={t('app:personal-information.work-phone')}
                defaultValue={loaderData.defaultValues.workPhone}
                errorMessage={t(extractValidationKey(errors?.workPhone))}
                required
              />
              <InputPhoneField
                id="personal-phone"
                name="personalPhone"
                label={t('app:personal-information.personal-phone')}
                defaultValue={loaderData.defaultValues.personalPhone}
                errorMessage={t(extractValidationKey(errors?.personalPhone))}
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
