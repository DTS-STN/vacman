import type { JSX } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import { ButtonLink } from '~/components/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/card';
import { FormErrorSummary } from '~/components/error-summary';
import { InputTextarea } from '~/components/input-textarea';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
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
  canEdit: boolean;
  isSubmitting?: boolean;
}

export function SomcConditionsForm({
  cancelLink,
  formValues,
  formErrors,
  params,
  canEdit,
  isSubmitting,
}: PositionInformationFormProps): JSX.Element {
  const { t } = useTranslation('app');

  return (
    <>
      <PageTitle className="after:w-14" subTitle={t('referral-request')}>
        {t('somc-conditions.page-title')}
      </PageTitle>
      <p className="my-8">{t('somc-conditions.page-content')}</p>
      {canEdit ? (
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
                lang="en"
                requiredForm="masculine"
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
                lang="fr"
                requiredForm="masculine"
              />
              <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
                <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                  {t('form.cancel')}
                </ButtonLink>
                <LoadingButton name="action" variant="primary" id="save-button" disabled={isSubmitting} loading={isSubmitting}>
                  {t('form.save')}
                </LoadingButton>
              </div>
            </div>
          </Form>
        </FormErrorSummary>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('somc-conditions.english-somc-label')}</CardTitle>
            </CardHeader>
            <CardContent>{formValues?.englishStatementOfMerit}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('somc-conditions.french-somc-label')}</CardTitle>
            </CardHeader>
            <CardContent>{formValues?.frenchStatementOfMerit}</CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
