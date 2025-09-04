import { useState } from 'react';
import type { JSX } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedBranch,
  LocalizedDirectorate,
  LocalizedLanguageOfCorrespondence,
  RequestReadModel,
} from '~/.server/domain/models';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { PageTitle } from '~/components/page-title';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface SubmissionDetailsFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<RequestReadModel> | undefined;
  branchOrServiceCanadaRegions: readonly LocalizedBranch[];
  directorates: readonly LocalizedDirectorate[];
  languagesOfCorrespondence: readonly LocalizedLanguageOfCorrespondence[];
  formErrors?: Errors;
  params: Params;
}

export function SubmissionDetailsForm({
  cancelLink,
  formValues,
  branchOrServiceCanadaRegions,
  directorates,
  languagesOfCorrespondence,
  formErrors,
  params,
}: SubmissionDetailsFormProps): JSX.Element {
  const { t } = useTranslation('app');

  const [branch, setBranch] = useState(formValues?.workUnit ? String(formValues.workUnit.parent?.id) : undefined);
  const [directorate, setDirectorate] = useState(
    formValues?.workUnit !== undefined ? String(formValues.workUnit.id) : undefined,
  );

  const branchOrServiceCanadaRegionOptions = [{ id: 'select-option', name: '' }, ...branchOrServiceCanadaRegions].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? t('form.select-option') : name,
    }),
  );

  const directorateOptions = [
    { id: 'select-option', name: '' },
    ...directorates.filter((c) => c.parent?.id === Number(branch)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? t('form.select-option') : name,
  }));

  const languageOptions = languagesOfCorrespondence.map(({ id, name }) => ({
    value: String(id),
    children: name,
    defaultChecked: id === formValues?.languageOfCorrespondence?.id,
  }));

  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = event.target.value;
    setBranch(newBranch);

    // Clear directorate if the new branch has no child directorates
    if (newBranch) {
      const hasChildren = directorates.some((directorate) => directorate.parent?.id === Number(newBranch));
      if (!hasChildren) {
        setDirectorate(undefined);
      }
    } else {
      setDirectorate(undefined);
    }
  };

  return (
    <>
      <PageTitle className="after:w-14" subTitle={t('referral-request')}>
        {t('submission-details.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <InputSelect
              id="branchOrServiceCanadaRegion"
              name="branchOrServiceCanadaRegion"
              errorMessage={t(extractValidationKey(formErrors?.branchOrServiceCanadaRegion))}
              required
              onChange={handleBranchChange}
              options={branchOrServiceCanadaRegionOptions}
              label={t('submission-details.branch-or-service-canada-region')}
              defaultValue={formValues?.workUnit !== undefined ? String(formValues.workUnit.parent?.id) : ''}
              className="w-full sm:w-1/2"
            />
            {branch && (
              <InputSelect
                id="directorate"
                name="directorate"
                errorMessage={t(extractValidationKey(formErrors?.directorate))}
                required
                options={directorateOptions}
                label={t('submission-details.directorate')}
                value={directorate ?? ''}
                onChange={({ target }) => setDirectorate(target.value || undefined)}
                className="w-full sm:w-1/2"
              />
            )}
            <InputRadios
              id="language-of-correspondence"
              name="languageOfCorrespondenceId"
              legend={t('submission-details.preferred-language-of-correspondence')}
              options={languageOptions}
              errorMessage={t(extractValidationKey(formErrors?.languageOfCorrespondenceId))}
              required
            />
            <InputTextarea
              id="additional-comment"
              className="w-full"
              label={t('submission-details.additional-comments')}
              name="additionalComment"
              defaultValue={formValues?.additionalComment}
              errorMessage={t(extractValidationKey(formErrors?.additionalComment))}
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
