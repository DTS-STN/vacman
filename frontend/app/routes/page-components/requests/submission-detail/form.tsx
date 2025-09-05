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
import type { InputRadiosProps } from '~/components/input-radios';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { PageTitle } from '~/components/page-title';
import { REQUIRE_OPTIONS } from '~/domain/constants';
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
  view: 'hr-advisor' | 'hiring-manager';
}

export function SubmissionDetailsForm({
  cancelLink,
  formValues,
  branchOrServiceCanadaRegions,
  directorates,
  languagesOfCorrespondence,
  formErrors,
  params,
  view,
}: SubmissionDetailsFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const isSubmiterHiringManagerOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked:
        formValues?.submitter && formValues.hiringManager ? formValues.submitter.id === formValues.hiringManager.id : undefined, // For new Request, the default should be undefined
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked:
        formValues?.submitter && formValues.hiringManager ? formValues.submitter.id !== formValues.hiringManager.id : undefined, // For new Request, the default should be undefined
    },
  ];

  const [branch, setBranch] = useState(formValues?.workUnit ? String(formValues.workUnit.parent?.id) : undefined);
  const [directorate, setDirectorate] = useState(
    formValues?.workUnit !== undefined ? String(formValues.workUnit.id) : undefined,
  );

  const branchOrServiceCanadaRegionOptions = [{ id: 'select-option', name: '' }, ...branchOrServiceCanadaRegions].map(
    ({ id, name }) => ({
      value: id === 'select-option' ? '' : String(id),
      children: id === 'select-option' ? tApp('form.select-option') : name,
    }),
  );

  const directorateOptions = [
    { id: 'select-option', name: '' },
    ...directorates.filter((c) => c.parent?.id === Number(branch)),
  ].map(({ id, name }) => ({
    value: id === 'select-option' ? '' : String(id),
    children: id === 'select-option' ? tApp('form.select-option') : name,
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
  const submitterName = `${formValues?.submitter?.firstName ?? ''} ${formValues?.submitter?.lastName ?? ''}`.trim();

  return (
    <>
      <PageTitle className="after:w-14" subTitle={tApp('referral-request')}>
        {tApp('submission-details.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <div className="rounded-2xl border bg-gray-100 px-3 py-0.5 text-sm font-semibold text-black">
              {view === 'hiring-manager'
                ? tApp('submission-details.hiring-manager.submitter', {
                    name: submitterName,
                  })
                : tApp('submission-details.hr-advisor.request-submitted-by', {
                    name: submitterName,
                  })}
            </div>
            <InputRadios
              id="is-submitter-hiring-manager"
              legend={
                view === 'hiring-manager'
                  ? tApp('submission-details.hiring-manager.are-you-hiring-manager-for-request')
                  : tApp('submission-details.hr-advisor.is-submitter-hiring-manager', {
                      name: submitterName,
                    })
              }
              name="isSubmiterHiringManager"
              options={isSubmiterHiringManagerOptions}
              required
              errorMessage={tApp(extractValidationKey(formErrors?.isSubmiterHiringManager))}
            />
            <InputSelect
              id="branchOrServiceCanadaRegion"
              name="branchOrServiceCanadaRegion"
              errorMessage={tApp(extractValidationKey(formErrors?.branchOrServiceCanadaRegion))}
              required
              onChange={handleBranchChange}
              options={branchOrServiceCanadaRegionOptions}
              label={tApp('submission-details.branch-or-service-canada-region')}
              defaultValue={formValues?.workUnit !== undefined ? String(formValues.workUnit.parent?.id) : ''}
              className="w-full sm:w-1/2"
            />
            {branch && (
              <InputSelect
                id="directorate"
                name="directorate"
                errorMessage={tApp(extractValidationKey(formErrors?.directorate))}
                required
                options={directorateOptions}
                label={tApp('submission-details.directorate')}
                value={directorate ?? ''}
                onChange={({ target }) => setDirectorate(target.value || undefined)}
                className="w-full sm:w-1/2"
              />
            )}
            <InputRadios
              id="language-of-correspondence"
              name="languageOfCorrespondenceId"
              legend={tApp('submission-details.preferred-language-of-correspondence')}
              options={languageOptions}
              errorMessage={tApp(extractValidationKey(formErrors?.languageOfCorrespondenceId))}
              required
            />
            <InputTextarea
              id="additional-comment"
              className="w-full"
              label={tApp('submission-details.additional-comments')}
              name="additionalComment"
              defaultValue={formValues?.additionalComment}
              errorMessage={tApp(extractValidationKey(formErrors?.additionalComment))}
              maxLength={100}
            />
            <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
              <Button name="action" variant="primary" id="save-button">
                {tApp('form.save')}
              </Button>
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}
