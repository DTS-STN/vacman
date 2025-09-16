import { useEffect, useRef, useState } from 'react';

import { useActionData, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { useFetcherState } from '~/hooks/use-fetcher-state';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export function loader({ context, request, params }: Route.LoaderArgs) {
  //TODO add loader logic
  return undefined;
}

export function action({ context, params, request }: Route.ActionArgs) {
  //TODO add action logic
  return undefined;
}

export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const actionData = useActionData();
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  const formActionData = fetcher.data ?? actionData;

  const alertRef = useRef<HTMLDivElement>(null);

  if (formActionData && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasRequestChanged, setHasRequestChanged] = useState(loaderData.hasRequestChanged);

  useEffect(() => {
    if (searchParams.get('edited') === 'true') {
      setHasRequestChanged(true);
      const newUrl = location.pathname;
      void navigate(newUrl, { replace: true });
    }
  }, [searchParams, location.pathname, navigate]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        <StatusTag
          status={{
            code: 'DRAFT',
            name: 'Draft',
          }}
        />

        <PageTitle>{t('app:hr-advisor-referral-requests.page-title')}</PageTitle>

        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-50 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>

      {formActionData && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.isProfileComplete ? 'success' : 'error'}
          message={loaderData.isProfileComplete ? t('app:profile.profile-submitted') : t('app:profile.profile-incomplete')}
          role="alert"
          ariaLive="assertive"
        />
      )}

      {hasRequestChanged && (
        <AlertMessage
          ref={alertRef}
          type="info"
          message={t('app:profile.profile-pending-approval')}
          role="status"
          ariaLive="polite"
        />
      )}

      <div className="mt-20 w-full">
        <ContextualAlert type={'info'} role="status" ariaLive="polite" textSmall={false}>
          <div className="text-black-800 pl-1 text-base">
            <p>{t('app:hr-advisor-referral-requests.page-info-1')}</p>
            <p className="mt-2">{t('app:hr-advisor-referral-requests.page-info-2')}</p>
            <p className="mt-2">{t('app:hr-advisor-referral-requests.page-info-3')}</p>
            <p className="mt-2">{t('app:hr-advisor-referral-requests.page-info-4')}</p>
          </div>
        </ContextualAlert>

        <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hr-advisor-referral-requests.request-details')}</h2>

        <div className="text-black-800 mt-4 max-w-prose text-base">
          {t('app:hr-advisor-referral-requests.page-description')}
        </div>

        {loaderData.status?.code !== undefined && (
          <div className="mt-4">
            <Progress className="color-[#2572B4] mt-8 mb-8" label="" value={loaderData.amountCompleted} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mt-8 max-w-prose space-y-10">
            <ProfileCard
              title={t('app:hr-advisor-referral-requests.process-information')}
              linkLabel={t('app:hr-advisor-referral-requests.edit-process-information')}
              file="routes/hiring-manager/request/process-information.tsx"
              isComplete={loaderData.isCompleteProcessInformation}
              isNew={loaderData.isProcessNew}
              params={params}
              errorState={formActionData?.processComplete === false}
              required
              showStatus
            >
              {loaderData.isProcessNew ? (
                <>{t('app:hr-advisor-referral-requests.process-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                    {loaderData.selectionProcessNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                    {loaderData.priorityEntitlement ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.priority-entitlement-rationale')}>
                    {loaderData.priorityEntitlementRationale ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.selection-process-type')}>
                    {loaderData.selectionProcessType?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.performed-duties')}>
                    {loaderData.hasPerformedSameDuties ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.employment-tenure')}>
                    {loaderData.employmentTenure?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.projected-start-date')}>
                    {loaderData.projectedStartDate ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.projected-end-date')}>
                    {loaderData.projectedEndDate ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.work-schedule')}>
                    {loaderData.workSchedule?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hr-advisor-referral-requests.position-information')}
              linkLabel={t('app:hr-advisor-referral-requests.edit-position-information')}
              file="routes/hiring-manager/request/position-information.tsx"
              isComplete={loaderData.isCompletePositionInformation}
              isNew={loaderData.isPositionNew}
              params={params}
              required
              errorState={formActionData?.positionComplete === false}
              showStatus
            >
              {loaderData.isPositionNew ? (
                <>{t('app:hr-advisor-referral-requests.position-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:position-information.position-number')}>
                    {loaderData.positionNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.group-and-level')}>
                    {loaderData.classification?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.title-en')}>
                    {loaderData.englishTitle ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.title-fr')}>
                    {loaderData.frenchTitle ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.language-profile')}>
                    {loaderData.languageRequirement?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.english')}>
                    {loaderData.englishLanguageProfile ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.french')}>
                    {loaderData.frenchLanguageProfile ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.security-requirement')}>
                    {loaderData.securityClearance?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hr-advisor-referral-requests.somc-conditions')}
              linkLabel={t('app:hr-advisor-referral-requests.edit-somc-conditions')}
              file="routes/hiring-manager/request/somc-conditions.tsx"
              isComplete={loaderData.isCompleteStatementOfMeritCriteriaInformaion}
              isNew={loaderData.isStatementOfMeritCriteriaNew}
              params={params}
              required
              errorState={formActionData?.statementOfMeritCriteriaComplete === false}
              showStatus
            >
              {loaderData.isStatementOfMeritCriteriaNew ? (
                <>{t('app:hr-advisor-referral-requests.somc-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:somc-conditions.english-somc-label')}>
                    {loaderData.englishStatementOfMerit ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:somc-conditions.french-somc-label')}>
                    {loaderData.frenchStatementOfMerit ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hr-advisor-referral-requests.submission-details')}
              linkLabel={t('app:hr-advisor-referral-requests.edit-submission-details')}
              file="routes/hiring-manager/request/submission-details.tsx"
              isComplete={loaderData.isCompleteSubmissionInformation}
              isNew={loaderData.isSubmissionNew}
              params={params}
              required
              errorState={formActionData?.submissionComplete === false}
              showStatus
            >
              {loaderData.isSubmissionNew ? (
                <>{t('app:hr-advisor-referral-requests.submission-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:submission-details.hiring-manager.submitter')}>
                    {(loaderData.submitter?.firstName, loaderData.submitter?.lastName) ??
                      t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.hiring-manager-name')}>
                    {(loaderData.hiringManager?.firstName, loaderData.hiringManager?.lastName) ??
                      t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.sub-delegate-name')}>
                    {(loaderData.subDelegatedManager?.firstName, loaderData.subDelegatedManager?.lastName) ??
                      t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.directorate')}></DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                    {loaderData.languageOfCorrespondence?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.additional-comments')}>
                    {loaderData.additionalComment ?? t('app:hr-advisor-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>
          </div>

          <div className="mt-8 max-w-prose">
            <div className="flex justify-center">
              <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                <ButtonLink
                  className="w-full"
                  variant="alternative"
                  file="routes/hiring-manager/index.tsx"
                  id="cancel"
                  disabled={isSubmitting}
                >
                  {t('app:form.cancel')}
                </ButtonLink>

                <ButtonLink
                  className="mt-4 w-full"
                  variant="alternative"
                  file="routes/employee/index.tsx"
                  id="save"
                  disabled={isSubmitting}
                >
                  {t('app:form.save-and-exit')}
                </ButtonLink>

                <LoadingButton
                  className="mt-4 w-full"
                  name="action"
                  variant="primary"
                  id="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {t('app:form.submit')}
                </LoadingButton>
              </fetcher.Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
