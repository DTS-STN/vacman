import { useEffect, useRef, useState } from 'react';
import type { JSX, MouseEvent } from 'react';

import { Form, useActionData, useFetcher } from 'react-router';
import type { Params } from 'react-router';

import { useTranslation } from 'react-i18next';

import type {
  LocalizedBranch,
  LocalizedDirectorate,
  LocalizedLanguageOfCorrespondence,
  RequestReadModel,
} from '~/.server/domain/models';
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
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
import { useFetcherState } from '~/hooks/use-fetcher-state';
import type { I18nRouteFile } from '~/i18n-routes';
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { extractValidationKey } from '~/utils/validation-utils';

interface ActionData {
  errors?: Errors;
  hiringManagerName?: string;
  subDelegatedManagerName?: string;
}

interface SubmissionDetailsFormProps {
  cancelLink: I18nRouteFile;
  formValues: Partial<RequestReadModel> | undefined;
  branchOrServiceCanadaRegions: readonly LocalizedBranch[];
  directorates: readonly LocalizedDirectorate[];
  languagesOfCorrespondence: readonly LocalizedLanguageOfCorrespondence[];
  params: Params;
  view: 'hr-advisor' | 'hiring-manager';
}

export function SubmissionDetailsForm({
  cancelLink,
  formValues,
  branchOrServiceCanadaRegions,
  directorates,
  languagesOfCorrespondence,
  params,
  view,
}: SubmissionDetailsFormProps): JSX.Element {
  const { t: tApp } = useTranslation('app');
  const { t: tGcweb } = useTranslation('gcweb');
  const fetcher = useFetcher<ActionData>();
  const fetcherState = useFetcherState(fetcher);
  const actionData = useActionData<ActionData>();
  const errors = actionData?.errors;

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

  const [hiringManagerName, setHiringManagerName] = useState(
    `${formValues?.hiringManager?.firstName ?? ''} ${formValues?.hiringManager?.lastName ?? ''}`.trim(),
  );
  const [subDelegatedManagerName, setSubDelegatedManagerName] = useState(
    `${formValues?.subDelegatedManager?.firstName ?? ''} ${formValues?.subDelegatedManager?.lastName ?? ''}`.trim(),
  );

  const [isHiringManagerEmailVerified, setIsHiringManagerEmailVerified] = useState(!!formValues?.hiringManager);
  const [isSubDelegatedManagerEmailVerified, setIsSubDelegatedManagerEmailVerified] = useState(
    !!formValues?.subDelegatedManager,
  );

  const [showHiringManagerEmailChangeError, setShowHiringManagerEmailChangeError] = useState(false);
  const [showSubDelegatedManagerEmailChangeError, setShowSubDelegatedManagerEmailChangeError] = useState(false);

  function onHiringManagerEmailChange() {
    setIsHiringManagerEmailVerified(false); // email changed, needs re-verification
    setHiringManagerName('');
  }

  function onSubDelegatedManagerEmailChange() {
    setIsSubDelegatedManagerEmailVerified(false); // email changed, needs re-verification
    setSubDelegatedManagerName('');
  }

  //on submit check if isHiringManagerEmailVerified or isSubDelegatedManagerEmailVerified is false then show error
  function handleEmailVerification(event: MouseEvent<HTMLButtonElement>) {
    if (!isHiringManagerEmailVerified || !isSubDelegatedManagerEmailVerified) {
      if (!isHiringManagerEmailVerified) setShowHiringManagerEmailChangeError(true);
      if (!isSubDelegatedManagerEmailVerified) setShowSubDelegatedManagerEmailChangeError(true);
      event.preventDefault();
      return;
    }
  }

  const alertRef = useRef<HTMLDivElement>(null);

  if (showHiringManagerEmailChangeError && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  useEffect(() => {
    if (actionData?.hiringManagerName) {
      setHiringManagerName(actionData.hiringManagerName);
      setIsHiringManagerEmailVerified(true);
      setShowHiringManagerEmailChangeError(false);
    }
  }, [actionData?.hiringManagerName]);

  useEffect(() => {
    if (actionData?.subDelegatedManagerName) {
      setSubDelegatedManagerName(actionData.subDelegatedManagerName);
      setIsSubDelegatedManagerEmailVerified(true);
      setShowSubDelegatedManagerEmailChangeError(false);
    }
  }, [actionData?.subDelegatedManagerName]);

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
  const submitterName = `${formValues?.submitter?.firstName ?? ''} ${formValues?.submitter?.lastName ?? ''}`.trim();

  return (
    <>
      <PageTitle className="after:w-14" subTitle={tApp('referral-request')}>
        {tApp('submission-details.page-title')}
      </PageTitle>
      <FormErrorSummary>
        <Form method="post" noValidate>
          <div className="space-y-6">
            {showHiringManagerEmailChangeError && (
              <AlertMessage
                ref={alertRef}
                type={'error'}
                message={tApp('submission-details.errors.hiring-manager-email-unverified')}
                role="alert"
                ariaLive="assertive"
              />
            )}
            {showSubDelegatedManagerEmailChangeError && (
              <AlertMessage
                ref={alertRef}
                type={'error'}
                message={tApp('submission-details.errors.sub-delegate-email-unverified')}
                role="alert"
                ariaLive="assertive"
              />
            )}
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
              errorMessage={tApp(extractValidationKey(errors?.isSubmiterHiringManager))}
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
                  errorMessage={tApp(extractValidationKey(errors?.isSubmiterSubdelegate))}
                />
              </>
            )}
            {isSubmitterHiringManager === false && (
              <>
                <div className="flex items-end gap-3">
                  <InputField
                    className="w-full"
                    id="hiring-manager-email-address"
                    name="hiringManagerEmailAddress"
                    label={tApp('submission-details.hiring-manager-email')}
                    defaultValue={formValues?.hiringManager?.businessEmailAddress}
                    errorMessage={tApp(extractValidationKey(errors?.hiringManagerEmailAddress))}
                    onChange={onHiringManagerEmailChange}
                    required
                  />
                  <LoadingButton
                    name="action"
                    value="searchHiringManagerEmailAddress"
                    variant="primary"
                    id="search-hiring-manager-button"
                    disabled={fetcherState.submitting}
                    loading={fetcherState.submitting && fetcherState.action === 'searchHiringManagerEmailAddress'}
                  >
                    {tApp('submission-details.search')}
                  </LoadingButton>
                </div>
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
                  errorMessage={tApp(extractValidationKey(errors?.isHiringManagerASubDelegate))}
                />
              </>
            )}
            {((isSubmitterHiringManager === true && isSubmitterSubDelegate === false) ||
              isHiringManagerASubDelegate === false) && (
              <>
                <div className="flex items-end gap-3">
                  <InputField
                    className="w-full"
                    id="sub-delegate-email-address"
                    name="subDelegatedManagerEmailAddress"
                    label={tApp('submission-details.sub-delegate-email')}
                    defaultValue={formValues?.subDelegatedManager?.businessEmailAddress}
                    errorMessage={tApp(extractValidationKey(errors?.subDelegatedManagerEmailAddress))}
                    onChange={onSubDelegatedManagerEmailChange}
                    required
                  />
                  <LoadingButton
                    name="action"
                    value="searchSubDelegatedManagerEmailAddress"
                    variant="primary"
                    id="search-sub-delegate-manager-button"
                    disabled={fetcherState.submitting}
                    loading={fetcherState.submitting && fetcherState.action === 'searchSubDelegatedManagerEmailAddress'}
                  >
                    {tApp('submission-details.search')}
                  </LoadingButton>
                </div>
                {subDelegatedManagerName && (
                  <NameTag
                    name={tApp('submission-details.sub-delegate-name', {
                      name: subDelegatedManagerName,
                    })}
                  />
                )}
              </>
            )}
            <InputSelect
              id="branchOrServiceCanadaRegion"
              name="branchOrServiceCanadaRegion"
              errorMessage={tApp(extractValidationKey(errors?.branchOrServiceCanadaRegion))}
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
                errorMessage={tApp(extractValidationKey(errors?.directorate))}
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
              errorMessage={tApp(extractValidationKey(errors?.languageOfCorrespondenceId))}
              required
            />
            <InputTextarea
              id="additional-comment"
              className="w-full"
              label={tApp('submission-details.additional-comments')}
              name="additionalComment"
              defaultValue={formValues?.additionalComment}
              errorMessage={tApp(extractValidationKey(errors?.additionalComment))}
              maxLength={100}
            />
            <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
              <ButtonLink file={cancelLink} params={params} id="cancel-button" variant="alternative">
                {tApp('form.cancel')}
              </ButtonLink>
              <Button name="action" variant="primary" value="submit" id="save-button" onClick={handleEmailVerification}>
                {tApp('form.save')}
              </Button>
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
