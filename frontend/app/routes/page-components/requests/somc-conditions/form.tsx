import type { JSX } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputTextarea } from '~/components/input-textarea';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

export type SomcConditions = {
  englishStatementOfMerit: string;
  frenchStatementOfMerit: string;
};

interface PositionInformationFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<SomcConditions> | undefined;
  formErrors?: Errors;
  params: Params;
}

export function SomcConditionsForm({ cancelLink, formValues, formErrors, params }: PositionInformationFormProps): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <>
      <h1 className="my-5 text-3xl font-semibold">{t('somc-conditions.page-title')}</h1>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputTextarea
              id="englishStatementOfMerit"
              className="w-full"
              label={t('somc-conditions.english-somc-label')}
              name="englishStatementOfMerit"
              helpMessage={t('somc-conditions.english-somc-help-message')}
              defaultValue={formValues?.englishStatementOfMerit}
              errorMessage={t(extractValidationKey(formErrors?.englishStatementOfMerit))}
              required
            />

            <InputTextarea
              id="frenchStatementOfMerit"
              className="w-full"
              label={t('somc-conditions.french-somc-label')}
              name="frenchStatementOfMerit"
              helpMessage={t('somc-conditions.french-somc-help-message')}
              defaultValue={formValues?.frenchStatementOfMerit}
              errorMessage={t(extractValidationKey(formErrors?.frenchStatementOfMerit))}
              required
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
