import type { RouteHandle } from 'react-router';
import { data, Form } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/personal-information';

import type { Profile } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputPhoneField } from '~/components/input-phone-field';
import { InputRadios } from '~/components/input-radios';
import { InputTextarea } from '~/components/input-textarea';
import { InlineLink } from '~/components/links';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { personalInformationSchema } from '~/routes/employee/[id]/profile/validation.server';
import { handle as parentHandle } from '~/routes/layout';
import { toE164 } from '~/utils/phone-utils';
import { formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

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
  const parseResult = v.safeParse(personalInformationSchema, {
    personalRecordIdentifier: formString(formData.get('personalRecordIdentifier')),
    preferredLanguage: formString(formData.get('preferredLanguage')),
    workEmail: formString(formData.get('workEmail')),
    personalEmail: formString(formData.get('personalEmail')),
    workPhone: formString(formData.get('workPhone')),
    personalPhone: formString(formData.get('personalPhone')),
    additionalInformation: formString(formData.get('additionalInformation')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof personalInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: Save form data & work email after validation, workEmail: context.session.authState.idTokenClaims.email

  return i18nRedirect('routes/employee/[id]/profile/index.tsx', request, {
    params: { id: currentUserId },
  });
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  // Use the id parameter from the URL to fetch the profile
  const profileUserId = params.id;
  const profileUser = await getUserService().getUserByActiveDirectoryId(profileUserId);
  const profileResult = await getProfileService().getProfile(profileUserId);

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const localizedLanguagesOfCorrespondenceResult = await getLanguageForCorrespondenceService().listAllLocalized(lang);
  const profileData: Profile = profileResult.unwrap();

  return {
    documentTitle: t('app:personal-information.page-title'),
    defaultValues: {
      personalRecordIdentifier: profileData.personalInformation.personalRecordIdentifier,
      preferredLanguage: profileData.personalInformation.preferredLanguageId,
      workEmail: profileUser?.businessEmail ?? profileData.personalInformation.workPhone,
      personalEmail: profileData.personalInformation.personalEmail,
      workPhone: toE164(profileData.personalInformation.workPhone),
      personalPhone: toE164(profileData.personalInformation.personalPhone),
      additionalInformation: profileData.personalInformation.additionalInformation,
    },
    languagesOfCorrespondence: localizedLanguagesOfCorrespondenceResult,
  };
}

export default function PersonalInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;
  const languageOptions = loaderData.languagesOfCorrespondence.map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === loaderData.defaultValues.preferredLanguage,
  }));

  return (
    <>
      <InlineLink className="mt-6 block" file="routes/employee/[id]/profile/index.tsx" params={params} id="back-button">
        {`< ${t('app:profile.back')}`}
      </InlineLink>
      <div className="max-w-prose">
        <h1 className="my-5 text-3xl font-semibold">{t('app:personal-information.page-title')}</h1>
        <FormErrorSummary>
          <Form method="post" noValidate>
            <div className="space-y-6">
              <InputField
                className="w-full"
                id="personal-record-identifier"
                name="personalRecordIdentifier"
                label={t('app:personal-information.personal-record-identifier')}
                defaultValue={loaderData.defaultValues.personalRecordIdentifier}
                errorMessage={t(extractValidationKey(errors?.personalRecordIdentifier))}
                helpMessagePrimary={t('app:personal-information.personal-record-identifier-help-message-primary')}
                required
              />
              <InputRadios
                id="preferred-language"
                name="preferredLanguage"
                legend={t('app:personal-information.preferred-language')}
                options={languageOptions}
                errorMessage={t(extractValidationKey(errors?.preferredLanguage))}
                required
              />
              <InputField
                readOnly
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
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                label={t('app:personal-information.work-phone')}
                defaultValue={loaderData.defaultValues.workPhone}
                errorMessage={t(extractValidationKey(errors?.workPhone))}
                helpMessagePrimary={
                  <Trans
                    ns={handle.i18nNamespace}
                    i18nKey="app:personal-information.work-phone-help-message-primary"
                    components={{ noWrap: <span className="whitespace-nowrap" /> }}
                  />
                }
              />

              <InputPhoneField
                id="personal-phone"
                name="personalPhone"
                type="tel"
                inputMode="tel"
                label={t('app:personal-information.personal-phone')}
                defaultValue={loaderData.defaultValues.personalPhone}
                errorMessage={t(extractValidationKey(errors?.personalPhone))}
                helpMessagePrimary={
                  <Trans
                    ns={handle.i18nNamespace}
                    i18nKey="app:personal-information.personal-phone-help-message-primary"
                    components={{ noWrap: <span className="whitespace-nowrap" /> }}
                  />
                }
                required
              />
              <InputTextarea
                id="additional-information"
                className="w-full"
                label={t('app:personal-information.additional-information')}
                name="additionalInformation"
                defaultValue={loaderData.defaultValues.additionalInformation}
                helpMessage={t('app:personal-information.additional-info-help-message')}
                maxLength={100}
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
        </FormErrorSummary>
      </div>
    </>
  );
}
