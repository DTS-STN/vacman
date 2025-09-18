import { useEffect, useRef, useState } from 'react';

import { useActionData, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { AlertMessage } from '~/components/alert-message';
import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { StatusTag } from '~/components/status-tag';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  //TODO add loader logic

  return {
    documentTitle: t('app:hr-advisor-referral-requests.page-title'),
    isProfileComplete: undefined,
    isCompleteProcessInformation: undefined,
    selectionProcessNumber: undefined,
    workforceMgmtApprovalRecvd: undefined,
    priorityEntitlement: undefined,
    priorityEntitlementRationale: undefined,
    selectionProcessType: undefined,
    hasPerformedSameDuties: undefined,
    appointmentNonAdvertised: undefined,
    employmentTenure: undefined,
    projectedStartDate: undefined,
    projectedEndDate: undefined,
    workSchedule: undefined,
    equityNeeded: undefined,
    employmentEquities: undefined,
    isCompletePositionInformation: undefined,
    isPositionNew: undefined,
    positionNumber: undefined,
    classification: undefined,
    englishTitle: undefined,
    frenchTitle: undefined,
    cities: undefined,
    languageRequirement: undefined,
    englishLanguageProfile: undefined,
    frenchLanguageProfile: undefined,
    securityClearance: undefined,
    isCompleteStatementOfMeritCriteriaInformaion: undefined,
    isStatementOfMeritCriteriaNew: undefined,
    englishStatementOfMerit: undefined,
    frenchStatementOfMerit: undefined,
    isCompleteSubmissionInformation: undefined,
    submitter: undefined,
    hiringManager: undefined,
    subDelegatedManager: undefined,
    directorate: undefined,
    languageOfCorrespondence: undefined,
    additionalComment: undefined,
    status: undefined,
    hrAdvisor: undefined,
    priorityClearanceNumber: undefined,
    pscClearanceNumber: undefined,
    requestNumber: undefined,
    hasRequestChanged: undefined,
    lang,
  };
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
            code: 'REQUEST_PENDING_APPROVAL',
            name: 'Request pending approval',
          }}
        />

        <PageTitle>{t('app:hr-advisor-referral-requests.page-title')}</PageTitle>

        <div>
          <DescriptionList className="flex">
            <DescriptionListItem
              className="mr-10 w-min whitespace-nowrap"
              term={t('app:hr-advisor-referral-requests.request-id')}
            >
              {loaderData.requestNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="mx-10 w-min whitespace-nowrap"
              term={t('app:hr-advisor-referral-requests.request-date')}
            >
              {loaderData.requestDate ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="mx-10 w-min whitespace-nowrap"
              term={t('app:hr-advisor-referral-requests.hiring-manager')}
            >
              {loaderData.hiringManager ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="ml-10 w-min whitespace-nowrap"
              term={t('app:hr-advisor-referral-requests.hr-advisor')}
            >
              {loaderData.hrAdvisor ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>
          </DescriptionList>
        </div>

        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-70 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
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
        <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hr-advisor-referral-requests.request-details')}</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mt-8 max-w-prose space-y-10">
            <ProfileCard
              title={t('app:hr-advisor-referral-requests.process-information')}
              isComplete={loaderData.isCompleteProcessInformation}
              params={params}
              errorState={formActionData?.processComplete === false}
            >
              <DescriptionList>
                <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                  {loaderData.selectionProcessNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.approval-received')}>
                  {loaderData.workforceMgmtApprovalRecvd ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                  {loaderData.priorityEntitlement ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.rationale')}>
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

                <DescriptionListItem term={t('app:process-information.employment-equity-identified-alt')}>
                  {loaderData.equityNeeded ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.preferred-employment-equities')}>
                  {loaderData.employmentEquities ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
            </ProfileCard>

            <ProfileCard
              title={t('app:hr-advisor-referral-requests.position-information')}
              isComplete={loaderData.isCompletePositionInformation}
              params={params}
              errorState={formActionData?.positionComplete === false}
            >
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

                <DescriptionListItem term={t('app:position-information.locations')}>
                  {loaderData.locations ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:position-information.language-requirement')}>
                  {loaderData.languageRequirement ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:position-information.language-profile')}>
                  {`${t('app:position-information.english')}: ${loaderData.englishLanguageProfile ?? t('app:hr-advisor-referral-requests.not-provided')}`}
                  <br />
                  {`${t('app:position-information.french')}: ${loaderData.frenchLanguageProfile ?? t('app:hr-advisor-referral-requests.not-provided')}`}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:position-information.security-requirement')}>
                  {loaderData.securityClearance?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
            </ProfileCard>

            <ProfileCard
              title={t('app:hr-advisor-referral-requests.somc-conditions')}
              isComplete={loaderData.isCompleteStatementOfMeritCriteriaInformaion}
              isNew={loaderData.isStatementOfMeritCriteriaNew}
              params={params}
              errorState={formActionData?.statementOfMeritCriteriaComplete === false}
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
              isComplete={loaderData.isCompleteSubmissionInformation}
              params={params}
              errorState={formActionData?.submissionComplete === false}
            >
              <DescriptionList>
                <DescriptionListItem term={t('app:submission-details.submiter-title')}>
                  {(loaderData.submitter?.firstName, loaderData.submitter?.lastName) ??
                    t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.hiring-manager-title')}>
                  {(loaderData.hiringManager?.firstName, loaderData.hiringManager?.lastName) ??
                    t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.sub-delegate-title')}>
                  {(loaderData.subDelegatedManager?.firstName, loaderData.subDelegatedManager?.lastName) ??
                    t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.directorate')}>
                  {loaderData.directorate ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                  {loaderData.languageOfCorrespondence?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.additional-comments')}>
                  {loaderData.additionalComment ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
            </ProfileCard>
          </div>

          <div className="mt-8 max-w-prose">
            <div className="flex justify-center">
              <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                {loaderData.isStatementOfMeritCriteriaNew ? (
                  <LoadingButton
                    className="mt-4 w-full"
                    name="action"
                    variant="primary"
                    id="pickup-request"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    {t('app:form.pickup-request')}
                  </LoadingButton>
                ) : (
                  <>
                    <ButtonLink
                      className="w-full"
                      variant="alternative"
                      file="routes/hr-advisor/index.tsx"
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
                      id="vms-not-required"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      {t('app:form.vms-not-required')}
                    </LoadingButton>

                    <LoadingButton
                      className="mt-4 w-full"
                      name="action"
                      variant="primary"
                      id="run-matches"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      {t('app:form.run-matches')}
                    </LoadingButton>
                  </>
                )}
              </fetcher.Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
