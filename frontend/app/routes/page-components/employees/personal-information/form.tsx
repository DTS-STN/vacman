import type { JSX } from 'react';

import type { Params } from 'react-router';
import { Form } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { LanguageOfCorrespondence, LocalizedLanguageOfCorrespondence } from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { InputPhoneField } from '~/components/input-phone-field';
import { InputRadios } from '~/components/input-radios';
import { InputTextarea } from '~/components/input-textarea';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/employees/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

export type UserPersonalInformation = {
  surname?: string;
  givenName?: string;
  personalRecordIdentifier?: string;
  preferredLanguage?: LanguageOfCorrespondence;
  workEmail: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  additionalInformation?: string;
};

interface PersonalInformationFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<UserPersonalInformation> | undefined;
  formErrors?: Errors;
  isReadOnly: boolean;
  languagesOfCorrespondence: readonly LocalizedLanguageOfCorrespondence[];
  params: Params;
}

export function PersonalInformationForm({
  cancelLink,
  isReadOnly,
  formValues,
  formErrors,
  languagesOfCorrespondence,
  params,
}: PersonalInformationFormProps): JSX.Element {
  const { t } = useTranslation('app');

  const languageOptions = languagesOfCorrespondence.map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.preferredLanguage?.id,
  }));

  return (
    <>
      <h1 className="my-5 text-3xl font-semibold">{t('personal-information.page-title')}</h1>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <input type="hidden" name="surname" value={formValues?.surname} />
            <input type="hidden" name="givenName" value={formValues?.givenName} />
            <InputField
              readOnly={isReadOnly}
              className="w-full"
              id="personal-record-identifier"
              name="personalRecordIdentifier"
              label={t('personal-information.personal-record-identifier')}
              defaultValue={formValues?.personalRecordIdentifier}
              errorMessage={t(extractValidationKey(formErrors?.personalRecordIdentifier))}
              helpMessagePrimary={t('personal-information.personal-record-identifier-help-message-primary')}
              required
            />
            <InputRadios
              id="preferred-language"
              name="preferredLanguageId"
              legend={t('personal-information.preferred-language')}
              options={languageOptions}
              errorMessage={t(extractValidationKey(formErrors?.preferredLanguageId))}
              required
            />
            <InputField
              readOnly
              className="w-full"
              id="work-email"
              name="workEmail"
              label={t('personal-information.work-email')}
              defaultValue={formValues?.workEmail}
              required
            />
            <InputField
              readOnly={isReadOnly}
              className="w-full"
              id="personal-email"
              name="personalEmail"
              label={t('personal-information.personal-email')}
              defaultValue={formValues?.personalEmail}
              errorMessage={t(extractValidationKey(formErrors?.personalEmail))}
              required
            />

            <InputPhoneField
              readOnly={isReadOnly}
              id="work-phone"
              name="workPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              label={t('personal-information.work-phone')}
              defaultValue={formValues?.workPhone}
              errorMessage={t(extractValidationKey(formErrors?.workPhone))}
              helpMessagePrimary={
                <Trans
                  i18nKey="app:personal-information.work-phone-help-message-primary"
                  components={{ noWrap: <span className="whitespace-nowrap" /> }}
                />
              }
            />

            <InputPhoneField
              readOnly={isReadOnly}
              id="personal-phone"
              name="personalPhone"
              type="tel"
              inputMode="tel"
              label={t('personal-information.personal-phone')}
              defaultValue={formValues?.personalPhone}
              errorMessage={t(extractValidationKey(formErrors?.personalPhone))}
              helpMessagePrimary={
                <Trans
                  i18nKey="app:personal-information.personal-phone-help-message-primary"
                  components={{ noWrap: <span className="whitespace-nowrap" /> }}
                />
              }
              required
            />
            <InputTextarea
              id="additional-information"
              className="w-full"
              label={t('personal-information.additional-information')}
              name="additionalInformation"
              defaultValue={formValues?.additionalInformation}
              helpMessage={t('personal-information.additional-info-help-message')}
              maxLength={100}
            />
            <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
              <Button name="action" variant="primary" id="save-button">
                {t('form.save')}
              </Button>
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {t('form.cancel')}
              </ButtonLink>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
