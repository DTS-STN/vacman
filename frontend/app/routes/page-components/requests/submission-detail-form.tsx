import { useState } from 'react';
import type { JSX } from 'react';

import { Form } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedBranch,
  LocalizedLanguageOfCorrespondence,
  LocalizedWorkUnit,
  RequestReadModel,
} from '~/.server/domain/models';
import { ButtonLink } from '~/components/button-link';
import { FormErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import type { InputRadiosProps } from '~/components/input-radios';
import { InputRadios } from '~/components/input-radios';
import { InputSelect } from '~/components/input-select';
import { InputTextarea } from '~/components/input-textarea';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { getUserFullName } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

interface SubmissionDetailsFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<RequestReadModel> | undefined;
  branchOrServiceCanadaRegions: readonly LocalizedBranch[];
  directorates: readonly LocalizedWorkUnit[];
  languagesOfCorrespondence: readonly LocalizedLanguageOfCorrespondence[];
  formErrors?: Errors;
  params: Params;
  view: 'hr-advisor' | 'hiring-manager';
  isSubmitting?: boolean;
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
  isSubmitting,
}: SubmissionDetailsFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');

  const [isSubmitterHiringManager, setIsSubmiterHiringManager] = useState(
    formValues?.submitter && formValues.hiringManager ? formValues.submitter.id === formValues.hiringManager.id : undefined,
  );
  const [isSubmitterSubDelegate, setIsSubmiterSubDelegate] = useState(
    formValues?.submitter && formValues.subDelegatedManager
      ? formValues.submitter.id === formValues.subDelegatedManager.id
      : undefined,
  );
  const [isHiringManagerASubDelegate, setIsHiringManagerASubDelegate] = useState(
    formValues?.hiringManager && formValues.subDelegatedManager
      ? formValues.hiringManager.id === formValues.subDelegatedManager.id
      : undefined,
  );

  function onHiringManagerEmailChange() {
    setHiringManagerName(''); // email changed
  }

  const [hiringManagerName, setHiringManagerName] = useState(getUserFullName(formValues?.hiringManager));
  const [subDelegatedManagerName, setSubDelegatedManagerName] = useState(getUserFullName(formValues?.subDelegatedManager));
  const [alternateContactName, setAlternateContactName] = useState(getUserFullName(formValues?.additionalContact));

  function onSubDelegatedManagerEmailChange() {
    setSubDelegatedManagerName(''); // email changed
  }

  function onAlternateContactEmailChange() {
    setAlternateContactName(''); // email changed
  }

  const [branch, setBranch] = useState(formValues?.workUnit ? String(formValues.workUnit.parent?.id) : undefined);
  const [directorate, setDirectorate] = useState(
    formValues?.workUnit !== undefined ? String(formValues.workUnit.id) : undefined,
  );

  const handleIsSubmiterHiringManagerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setIsSubmiterHiringManager(selectedValue === REQUIRE_OPTIONS.yes);
  };

  const handleIsSubmiterSubdelegateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setIsSubmiterSubDelegate(selectedValue === REQUIRE_OPTIONS.yes);
  };

  const handleIsHiringManagerASubDelegateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setIsHiringManagerASubDelegate(selectedValue === REQUIRE_OPTIONS.yes);
  };

  const isSubmiterHiringManagerOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: isSubmitterHiringManager === true,
      onChange: handleIsSubmiterHiringManagerChange,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: isSubmitterHiringManager === false,
      onChange: handleIsSubmiterHiringManagerChange,
    },
  ];

  const isSubmiterSubdelegateOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: isSubmitterSubDelegate === true,
      onChange: handleIsSubmiterSubdelegateChange,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: isSubmitterSubDelegate === false,
      onChange: handleIsSubmiterSubdelegateChange,
    },
  ];

  const isHiringManagerASubDelegateOptions: InputRadiosProps['options'] = [
    {
      children: tGcweb('input-option.yes'),
      value: REQUIRE_OPTIONS.yes,
      defaultChecked: isHiringManagerASubDelegate === true,
      onChange: handleIsHiringManagerASubDelegateChange,
    },
    {
      children: tGcweb('input-option.no'),
      value: REQUIRE_OPTIONS.no,
      defaultChecked: isHiringManagerASubDelegate === false,
      onChange: handleIsHiringManagerASubDelegateChange,
    },
  ];

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
  const submitterName = getUserFullName(formValues?.submitter);

  return (
    <>
      <PageTitle className="after:w-14" subTitle={tApp('referral-request')}>
        {tApp('submission-details.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            <NameTag
              name={
                view === 'hiring-manager'
                  ? tApp('submission-details.hiring-manager.submitter', {
                      name: submitterName,
                    })
                  : tApp('submission-details.hr-advisor.request-submitted-by', {
                      name: submitterName,
                    })
              }
            />
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
            {isSubmitterHiringManager === true && (
              <>
                <InputRadios
                  id="is-submitter-sub-delegate"
                  legend={
                    view === 'hiring-manager'
                      ? tApp('submission-details.hiring-manager.are-you-a-subdelegate')
                      : tApp('submission-details.hr-advisor.is-submitter-a-sub-delegate', {
                          name: submitterName,
                        })
                  }
                  name="isSubmiterSubdelegate"
                  options={isSubmiterSubdelegateOptions}
                  required
                  errorMessage={tApp(extractValidationKey(formErrors?.isSubmiterSubdelegate))}
                />
              </>
            )}
            {isSubmitterHiringManager === false && (
              <>
                <InputField
                  className="w-full"
                  id="hiring-manager-email-address"
                  name="hiringManagerEmailAddress"
                  label={tApp('submission-details.hiring-manager-email')}
                  defaultValue={formValues?.hiringManager?.businessEmailAddress}
                  errorMessage={tApp(extractValidationKey(formErrors?.hiringManagerEmailAddress))}
                  onChange={onHiringManagerEmailChange}
                  required
                />
                {hiringManagerName && (
                  <NameTag
                    name={tApp('submission-details.hiring-manager-name', {
                      name: hiringManagerName,
                    })}
                  />
                )}
                <InputRadios
                  id="is-hiring-manager-a-sub-delegate"
                  legend={tApp('submission-details.is-hiring-manager-sub-delegate')}
                  name="isHiringManagerASubDelegate"
                  options={isHiringManagerASubDelegateOptions}
                  required
                  errorMessage={tApp(extractValidationKey(formErrors?.isHiringManagerASubDelegate))}
                />
              </>
            )}
            {((isSubmitterHiringManager === true && isSubmitterSubDelegate === false) ||
              isHiringManagerASubDelegate === false) && (
              <>
                <InputField
                  className="w-full"
                  id="sub-delegate-email-address"
                  name="subDelegatedManagerEmailAddress"
                  label={tApp('submission-details.sub-delegate-email')}
                  defaultValue={formValues?.subDelegatedManager?.businessEmailAddress}
                  errorMessage={tApp(extractValidationKey(formErrors?.subDelegatedManagerEmailAddress))}
                  onChange={onSubDelegatedManagerEmailChange}
                  required
                />
                {subDelegatedManagerName && (
                  <NameTag
                    name={tApp('submission-details.sub-delegate-name', {
                      name: subDelegatedManagerName,
                    })}
                  />
                )}
              </>
            )}
            <InputField
              className="w-full"
              id="additional-contact-email-address"
              name="additionalContactBusinessEmailAddress"
              label={tApp('submission-details.alternate-contact-email')}
              defaultValue={formValues?.additionalContact?.businessEmailAddress}
              errorMessage={tApp(extractValidationKey(formErrors?.additionalContactBusinessEmailAddress))}
              onChange={onAlternateContactEmailChange}
            />
            {alternateContactName && (
              <NameTag
                name={tApp('submission-details.alternate-contact-name', {
                  name: alternateContactName,
                })}
              />
            )}
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
            <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
              <LoadingButton name="action" variant="primary" id="save-button" disabled={isSubmitting} loading={isSubmitting}>
                {tApp('form.save')}
              </LoadingButton>
            </div>
          </div>
        </Form>
      </FormErrorSummary>
    </>
  );
}

interface NameTagProps {
  name: string;
}

function NameTag({ name }: NameTagProps): JSX.Element {
  return <div className="w-fit rounded-2xl border bg-gray-100 px-3 py-0.5 text-sm font-semibold text-black">{name}</div>;
}
