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
import { PageTitle } from '~/components/page-title';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/profile/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

export type UserPersonalInformation = {
  firstName?: string;
  lastName?: string;
  personalRecordIdentifier?: string;
  languageOfCorrespondence?: LanguageOfCorrespondence;
  businessEmailAddress: string;
  personalEmailAddress?: string;
  businessPhoneNumber?: string;
  personalPhoneNumber?: string;
  additionalComment?: string;
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
    defaultChecked: id === formValues?.languageOfCorrespondence?.id,
  }));

  return (
    <>
      <PageTitle className="after:w-14">{t('personal-information.page-title')}</PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <input type="hidden" name="firstName" value={formValues?.firstName} />
            <input type="hidden" name="lastName" value={formValues?.lastName} />
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
              id="language-of-correspondence"
              name="languageOfCorrespondenceId"
              legend={t('personal-information.language-of-correspondence')}
              options={languageOptions}
              errorMessage={t(extractValidationKey(formErrors?.languageOfCorrespondenceId))}
              required
            />
            <InputField
              readOnly
              className="w-full"
              id="business-email-address"
              name="businessEmailAddress"
              label={t('personal-information.work-email')}
              defaultValue={formValues?.businessEmailAddress}
              required
            />
            <InputField
              readOnly={isReadOnly}
              className="w-full"
              id="personal-email-address"
              name="personalEmailAddress"
              label={t('personal-information.personal-email')}
              defaultValue={formValues?.personalEmailAddress}
              errorMessage={t(extractValidationKey(formErrors?.personalEmailAddress))}
              required
            />

            <InputPhoneField
              readOnly={isReadOnly}
              id="business-phone-number"
              name="businessPhoneNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              label={t('personal-information.work-phone')}
              defaultValue={formValues?.businessPhoneNumber}
              errorMessage={t(extractValidationKey(formErrors?.businessPhoneNumber))}
              helpMessagePrimary={
                <Trans
                  i18nKey="app:personal-information.work-phone-help-message-primary"
                  components={{ noWrap: <span className="whitespace-nowrap" /> }}
                />
              }
            />

            <InputPhoneField
              readOnly={isReadOnly}
              id="personal-phone-number"
              name="personalPhoneNumber"
              type="tel"
              inputMode="tel"
              label={t('personal-information.personal-phone')}
              defaultValue={formValues?.personalPhoneNumber}
              errorMessage={t(extractValidationKey(formErrors?.personalPhoneNumber))}
              helpMessagePrimary={
                <Trans
                  i18nKey="app:personal-information.personal-phone-help-message-primary"
                  components={{ noWrap: <span className="whitespace-nowrap" /> }}
                />
              }
              required
            />
            <InputTextarea
              id="additional-comment"
              className="w-full"
              label={t('personal-information.additional-information')}
              name="additionalComment"
              defaultValue={formValues?.additionalComment}
              errorMessage={t(extractValidationKey(formErrors?.additionalComment))}
              helpMessage={t('personal-information.additional-info-help-message')}
              maxLength={100}
            />
            <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {t('form.cancel')}
              </ButtonLink>
              <Button name="action" variant="primary" id="save-button">
                {t('form.save')}
              </Button>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
