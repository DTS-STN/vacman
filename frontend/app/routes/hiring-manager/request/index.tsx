import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getCityService } from '~/.server/domain/services/city-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getRequestStatusService } from '~/.server/domain/services/request-status-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { countCompletedItems } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { AlertMessage } from '~/components/alert-message';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/dialog';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { StatusTag } from '~/components/status-tag';
import {
  EMPLOYMENT_TENURE,
  LANGUAGE_REQUIREMENT_CODES,
  REQUEST_EVENT_TYPE,
  REQUEST_STATUS_CODE,
  SELECTION_PROCESS_TYPE,
} from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formatISODate } from '~/utils/date-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), context.session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const formData = await request.formData();
  const formAction = formData.get('_action');

  if (formAction === 'cancel') {
    const cancelRequest = await getRequestService().deleteRequestById(
      Number(params.requestId),
      context.session.authState.accessToken,
    );

    if (cancelRequest.isErr()) {
      const error = cancelRequest.unwrapErr();
      return {
        status: 'error',
        errorMessage: error.message,
        errorCode: error.errorCode,
      };
    }

    return i18nRedirect('routes/hiring-manager/requests.tsx', request);
  }

  // For process information from Request Model
  const requiredProcessFields = {
    selectionProcessNumber: requestData.selectionProcessNumber,
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
    priorityEntitlement: requestData.priorityEntitlement,
    ...(requestData.priorityEntitlement
      ? {
          priorityEntitlementRationale: requestData.priorityEntitlementRationale,
        }
      : {}),
    ...(requestData.selectionProcessType?.id === SELECTION_PROCESS_TYPE.externalNonAdvertised
      ? {
          hasPerformedSameDuties: requestData.hasPerformedSameDuties,
          appointmentNonAdvertised: requestData.appointmentNonAdvertised,
        }
      : {}),
    ...(requestData.employmentTenure?.code === EMPLOYMENT_TENURE.term
      ? {
          projectedStartDate: requestData.projectedStartDate,
          projectedEndDate: requestData.projectedEndDate,
        }
      : {}),
    ...(requestData.equityNeeded === true
      ? {
          employmentEquities: requestData.employmentEquities,
        }
      : {}),
  };

  const languageProficiencyRequired =
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative;

  // For position information from Request Model
  const requiredPositionFields = {
    positionNumber: requestData.positionNumber,
    classification: requestData.classification,
    englishTitle: requestData.englishTitle,
    frenchTitle: requestData.frenchTitle,
    cities: requestData.cities,
    languageRequirement: requestData.languageRequirement,
    ...(languageProficiencyRequired
      ? {
          englishLanguageProfile: requestData.englishLanguageProfile,
          frenchLanguageProfile: requestData.frenchLanguageProfile,
        }
      : {}),
    securityClearance: requestData.securityClearance,
  };

  // For Statement of Merit Criteria and Conditions of Employment from Request Model
  const requiredStatementOfMeritCriteriaFields = {
    englishStatementOfMerit: requestData.englishStatementOfMerit,
    frenchStatementOfMerit: requestData.frenchStatementOfMerit,
  };

  // For Submission details from Request Model
  const submissionFields = {
    submitter: requestData.submitter,
    hiringManager: requestData.hiringManager,
    subDelegatedManager: requestData.subDelegatedManager,
    workUnit: requestData.workUnit,
    languageOfCorrespondence: requestData.languageOfCorrespondence,
    additionalComment: requestData.additionalComment,
  };

  // Check if all sections are complete
  const processInfoComplete = countCompletedItems(requiredProcessFields) === Object.keys(requiredProcessFields).length;
  const positionInfoComplete = countCompletedItems(requiredPositionFields) === Object.keys(requiredPositionFields).length;
  const statementOfMeritCriteriaInfoComplete =
    countCompletedItems(requiredStatementOfMeritCriteriaFields) === Object.keys(requiredStatementOfMeritCriteriaFields).length;
  const submissionInfoComplete = countCompletedItems(submissionFields) === Object.keys(submissionFields).length;

  // If any section is incomplete, return incomplete state
  if (!processInfoComplete || !positionInfoComplete || !statementOfMeritCriteriaInfoComplete || !submissionInfoComplete) {
    return {
      processInfoComplete,
      positionInfoComplete,
      statementOfMeritCriteriaInfoComplete,
      submissionInfoComplete,
    };
  }

  const submitResult = await getRequestService().updateRequestStatus(
    Number(params.requestId),
    REQUEST_EVENT_TYPE.submitted,
    context.session.authState.accessToken,
  );

  if (submitResult.isErr()) {
    const error = submitResult.unwrapErr();
    return {
      status: 'error',
      errorMessage: error.message,
      errorCode: error.errorCode,
    };
  }

  return {
    status: 'submitted',
    requestStatus: submitResult.unwrap(),
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), context.session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const url = new URL(request.url);
  const hasRequestChanged = url.searchParams.get('edited') === 'true';

  const [
    allLocalizedCities,
    allLocalizedProcessTypes,
    allLocalizedAppointmentNonAdvertised,
    allLocalizedTenures,
    allLocalizedWorkSchedules,
    allLocalizedEmploymentEquities,
    allLocalizedDirectorates,
    allLocalizedPreferredLanguage,
    allLocalizedRequestStatus,
  ] = await Promise.all([
    getCityService().listAllLocalized(lang),
    getSelectionProcessTypeService().listAllLocalized(lang),
    getNonAdvertisedAppointmentService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
    getWorkScheduleService().listAllLocalized(lang),
    getEmploymentEquityService().listAllLocalized(lang),
    getDirectorateService().listAllLocalized(lang),
    getLanguageForCorrespondenceService().listAllLocalized(lang),
    getRequestStatusService().listAllLocalized(lang),
  ]);

  // Process information from Request type
  const processInformationData = {
    processInformationNumber: requestData.selectionProcessNumber,
    selectionProcessNumber: requestData.selectionProcessNumber,
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
    priorityEntitlement: requestData.priorityEntitlement,
    priorityEntitlementRationale: requestData.priorityEntitlementRationale,
    selectionProcessType: requestData.selectionProcessType,
    hasPerformedSameDuties: requestData.hasPerformedSameDuties,
    appointmentNonAdvertised: requestData.appointmentNonAdvertised,
    employmentTenure: requestData.employmentTenure,
    projectedStartDate: requestData.projectedStartDate,
    projectedEndDate: requestData.projectedEndDate,
    workSchedule: requestData.workSchedule,
    equityNeeded: requestData.equityNeeded,
    employmentEquities: requestData.employmentEquities,
  };

  const requiredProcessInformation = {
    processInformationNumber: processInformationData.processInformationNumber,
    selectionProcessNumber: processInformationData.selectionProcessNumber,
    workforceMgmtApprovalRecvd: processInformationData.workforceMgmtApprovalRecvd,
    priorityEntitlement: processInformationData.priorityEntitlement,
    ...(requestData.priorityEntitlement
      ? {
          priorityEntitlementRationale: processInformationData.priorityEntitlementRationale,
        }
      : {}),
    ...(requestData.selectionProcessType?.id === SELECTION_PROCESS_TYPE.externalNonAdvertised
      ? {
          hasPerformedSameDuties: processInformationData.hasPerformedSameDuties,
          appointmentNonAdvertised: processInformationData.appointmentNonAdvertised,
        }
      : {}),
    ...(requestData.employmentTenure?.code === EMPLOYMENT_TENURE.term
      ? {
          projectedStartDate: processInformationData.projectedStartDate,
          projectedEndDate: processInformationData.projectedEndDate,
        }
      : {}),
    ...(requestData.equityNeeded === true
      ? {
          employmentEquities: processInformationData.employmentEquities,
        }
      : {}),
  };
  const processInformationCompleted = countCompletedItems(requiredProcessInformation);
  const processInformationTotalFields = Object.keys(requiredProcessInformation).length;

  // Position information from Request type
  const positionInformationData = {
    positionNumber: requestData.positionNumber,
    classification: requestData.classification,
    englishTitle: requestData.englishTitle,
    frenchTitle: requestData.frenchTitle,
    cities: requestData.cities,
    languageRequirement: requestData.languageRequirement,
    englishLanguageProfile: requestData.englishLanguageProfile,
    frenchLanguageProfile: requestData.frenchLanguageProfile,
    securityClearance: requestData.securityClearance,
  };

  const languageProficiencyRequired =
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative;

  const requiredPositionInformation = {
    positionNumber: positionInformationData.positionNumber,
    classification: positionInformationData.classification,
    englishTitle: positionInformationData.englishTitle,
    frenchTitle: positionInformationData.frenchTitle,
    cities: positionInformationData.cities,
    languageRequirement: positionInformationData.languageRequirement,
    securityClearance: positionInformationData.securityClearance,
    ...(languageProficiencyRequired
      ? {
          englishLanguageProfile: positionInformationData.englishLanguageProfile,
          frenchLanguageProfile: positionInformationData.frenchLanguageProfile,
        }
      : {}),
  };
  const positionInformationCompleted = countCompletedItems(requiredPositionInformation);
  const positionInformationTotalFields = Object.keys(requiredPositionInformation).length;

  // Statement of Merit and Conditions Information from Request type
  const statementOfMeritCriteriaInformationData = {
    englishStatementOfMerit: requestData.englishStatementOfMerit,
    frenchStatementOfMerit: requestData.frenchStatementOfMerit,
  };

  const requiredStatementOfMeritCriteriaInformation = statementOfMeritCriteriaInformationData;
  const statementOfMeritCriteriaInformationCompleted = countCompletedItems(requiredStatementOfMeritCriteriaInformation);
  const statementOfMeritCriteriaInformationTotalFields = Object.keys(requiredStatementOfMeritCriteriaInformation).length;

  // Submission Information from Request type
  const submissionInformationData = {
    submitter: requestData.submitter,
    hiringManager: requestData.hiringManager,
    subDelegatedManager: requestData.subDelegatedManager,
    workUnit: requestData.workUnit,
    languageOfCorrespondence: requestData.languageOfCorrespondence,
    additionalComment: requestData.additionalComment,
  };

  const requiredSubmissionInformation = submissionInformationData;
  const submissionInformationCompleted = countCompletedItems(requiredSubmissionInformation);
  const submissionInformationTotalFields = Object.keys(requiredSubmissionInformation).length;

  // Determine completeness
  const isCompleteProcessInformation = processInformationCompleted === processInformationTotalFields;
  const isCompletePositionInformation = positionInformationCompleted === positionInformationTotalFields;
  const isCompleteStatementOfMeritCriteriaInformaion =
    statementOfMeritCriteriaInformationCompleted === statementOfMeritCriteriaInformationTotalFields;
  const isCompleteSubmissionInformation = submissionInformationCompleted === submissionInformationTotalFields;

  const profileCompleted =
    processInformationCompleted +
    positionInformationCompleted +
    statementOfMeritCriteriaInformationCompleted +
    submissionInformationCompleted;
  const profileTotalFields =
    processInformationTotalFields +
    positionInformationTotalFields +
    statementOfMeritCriteriaInformationTotalFields +
    submissionInformationTotalFields;
  const amountCompleted = (profileCompleted / profileTotalFields) * 100;
  const cities = requestData.cities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);
  const employmentEquities = requestData.employmentEquities
    ?.map((eq) => allLocalizedEmploymentEquities.find((e) => e.code === eq.code))
    .filter(Boolean);

  return {
    documentTitle: t('app:hiring-manager-referral-requests.page-title'),
    amountCompleted: amountCompleted,
    isRequestComplete:
      isCompleteProcessInformation &&
      isCompletePositionInformation &&
      isCompleteStatementOfMeritCriteriaInformaion &&
      isCompleteSubmissionInformation,
    isCompleteProcessInformation,
    isProcessNew: processInformationCompleted === 0,
    selectionProcessNumber: requestData.selectionProcessNumber,
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
    priorityEntitlement: requestData.priorityEntitlement,
    priorityEntitlementRationale: requestData.priorityEntitlementRationale,
    selectionProcessType: allLocalizedProcessTypes.find((s) => s.code === requestData.selectionProcessType?.code),
    hasPerformedSameDuties: requestData.hasPerformedSameDuties,
    appointmentNonAdvertised: allLocalizedAppointmentNonAdvertised.find(
      (a) => a.code === requestData.appointmentNonAdvertised?.code,
    ),
    employmentTenure: allLocalizedTenures.find((t) => t.code === requestData.employmentTenure?.code),
    projectedStartDate: requestData.projectedStartDate,
    projectedEndDate: requestData.projectedEndDate,
    workSchedule: allLocalizedWorkSchedules.find((w) => w.code === requestData.workSchedule?.code),
    equityNeeded: requestData.equityNeeded,
    employmentEquities: employmentEquities?.map((eq) => eq?.name).join(', '),
    isCompletePositionInformation,
    isPositionNew: positionInformationCompleted === 0,
    positionNumber: requestData.positionNumber,
    classification: requestData.classification,
    englishTitle: requestData.englishTitle,
    frenchTitle: requestData.frenchTitle,
    cities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
    languageRequirement: requestData.languageRequirement,
    englishLanguageProfile: requestData.englishLanguageProfile,
    frenchLanguageProfile: requestData.frenchLanguageProfile,
    securityClearance: requestData.securityClearance,
    isCompleteStatementOfMeritCriteriaInformaion,
    isStatementOfMeritCriteriaNew: statementOfMeritCriteriaInformationCompleted === 0,
    englishStatementOfMerit: requestData.englishStatementOfMerit,
    frenchStatementOfMerit: requestData.frenchStatementOfMerit,
    isCompleteSubmissionInformation,
    isSubmissionNew: submissionInformationCompleted === 0,
    submitter: requestData.submitter,
    hiringManager: requestData.hiringManager,
    subDelegatedManager: requestData.subDelegatedManager,
    directorate: allLocalizedDirectorates.find((c) => c.code === requestData.workUnit?.code),
    languageOfCorrespondence: allLocalizedPreferredLanguage.find((p) => p.code === requestData.languageOfCorrespondence?.code),
    additionalComment: requestData.additionalComment,
    status: allLocalizedRequestStatus.find((s) => s.code === requestData.status?.code),
    hrAdvisor: requestData.hrAdvisor,
    priorityClearanceNumber: requestData.priorityClearanceNumber,
    pscClearanceNumber: requestData.pscClearanceNumber,
    requestNumber: requestData.requestNumber,
    requestDate: requestData.createdDate,
    hasRequestChanged,
    lang,
  };
}

export default function EditRequest({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  const alertRef = useRef<HTMLDivElement>(null);

  if (fetcher.data && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [hasRequestChanged, setHasRequestChanged] = useState(loaderData.hasRequestChanged);
  const [showDialog, setShowDialog] = useState(false);

  // Clean the URL after reading the param
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
        {loaderData.status && (
          <StatusTag
            status={{
              code: loaderData.status.code,
              name: loaderData.status.name,
            }}
          />
        )}

        <PageTitle>{t('app:hiring-manager-referral-requests.page-title')}</PageTitle>

        {loaderData.status?.code === REQUEST_STATUS_CODE.SUBMIT && (
          <div>
            <DescriptionList className="flex">
              <DescriptionListItem
                className="mr-10 w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.request-id')}
              >
                {loaderData.requestNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
              </DescriptionListItem>

              <DescriptionListItem
                className="mx-10 w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.request-date')}
              >
                {loaderData.requestDate
                  ? formatISODate(loaderData.requestDate)
                  : t('app:hiring-manager-referral-requests.not-provided')}
              </DescriptionListItem>

              <DescriptionListItem
                className="mx-10 w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.hiring-manager')}
              >
                {loaderData.hiringManager ? (
                  <>
                    {`${loaderData.hiringManager.firstName} ${loaderData.hiringManager.lastName}`}
                    <br />
                    {loaderData.hiringManager.businessEmailAddress}
                  </>
                ) : (
                  t('app:hiring-manager-referral-requests.not-provided')
                )}
              </DescriptionListItem>

              <DescriptionListItem
                className="ml-10 w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.hr-advisor')}
              >
                {loaderData.hrAdvisor
                  ? `${loaderData.hrAdvisor.firstName} ${loaderData.hrAdvisor.lastName}`
                  : t('app:hiring-manager-referral-requests.not-assigned')}
              </DescriptionListItem>
            </DescriptionList>
          </div>
        )}

        <div
          role="presentation"
          className={cn(
            loaderData.status?.code === REQUEST_STATUS_CODE.SUBMIT ? 'h-70' : 'h-50',
            "absolute top-25 left-0 -z-10 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat",
          )}
        />
      </div>

      {fetcher.data && (
        <AlertMessage
          ref={alertRef}
          type={loaderData.isRequestComplete ? 'success' : 'error'}
          message={
            loaderData.isRequestComplete
              ? t('app:hiring-manager-referral-requests.request-submitted')
              : t('app:hiring-manager-referral-requests.request-incomplete')
          }
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
            <p>{t('app:hiring-manager-referral-requests.page-info-1')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-2')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-3')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-4')}</p>
          </div>
        </ContextualAlert>

        <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hiring-manager-referral-requests.request-details')}</h2>

        <div className="text-black-800 mt-4 max-w-prose text-base">
          {t('app:hiring-manager-referral-requests.page-description')}
        </div>

        {loaderData.status?.code !== REQUEST_STATUS_CODE.SUBMIT && (
          <div className="mt-4">
            <Progress
              className="color-[#2572B4] mt-8 mb-8"
              label={t('app:hiring-manager-referral-requests.request-completion-progress')}
              value={loaderData.amountCompleted}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mt-8 max-w-prose space-y-10">
            <ProfileCard
              title={t('app:hiring-manager-referral-requests.process-information')}
              linkLabel={t('app:hiring-manager-referral-requests.edit-process-information')}
              file="routes/hiring-manager/request/process-information.tsx"
              isComplete={loaderData.isCompleteProcessInformation}
              isNew={loaderData.isProcessNew}
              params={params}
              errorState={fetcher.data?.processInfoComplete === false}
              required
              showStatus
            >
              {loaderData.isProcessNew ? (
                <>{t('app:hiring-manager-referral-requests.process-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                    {loaderData.selectionProcessNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.approval-received')}>
                    {loaderData.workforceMgmtApprovalRecvd
                      ? t('app:process-information.yes')
                      : t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                    {loaderData.priorityEntitlement === true
                      ? t('app:process-information.yes')
                      : loaderData.priorityEntitlement === false
                        ? t('app:process-information.no')
                        : t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {loaderData.priorityEntitlement === true && (
                    <DescriptionListItem term={t('app:process-information.priority-entitlement-rationale')}>
                      {loaderData.priorityEntitlementRationale ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>
                  )}

                  <DescriptionListItem term={t('app:process-information.selection-process-type')}>
                    {loaderData.selectionProcessType?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {loaderData.selectionProcessType?.id === SELECTION_PROCESS_TYPE.externalNonAdvertised && (
                    <>
                      <DescriptionListItem term={t('app:process-information.performed-duties')}>
                        {loaderData.hasPerformedSameDuties === true
                          ? t('app:process-information.yes')
                          : loaderData.hasPerformedSameDuties === false
                            ? t('app:process-information.no')
                            : t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>

                      <DescriptionListItem term={t('app:process-information.non-advertised-appointment')}>
                        {loaderData.appointmentNonAdvertised?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>
                    </>
                  )}

                  <DescriptionListItem term={t('app:process-information.employment-tenure')}>
                    {loaderData.employmentTenure?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {loaderData.employmentTenure?.code === EMPLOYMENT_TENURE.term && (
                    <>
                      <DescriptionListItem term={t('app:process-information.projected-start-date')}>
                        {loaderData.projectedStartDate ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>

                      <DescriptionListItem term={t('app:process-information.projected-end-date')}>
                        {loaderData.projectedEndDate ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>
                    </>
                  )}

                  <DescriptionListItem term={t('app:process-information.work-schedule')}>
                    {loaderData.workSchedule?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.employment-equity-identified')}>
                    {loaderData.equityNeeded === true
                      ? t('app:process-information.yes')
                      : loaderData.equityNeeded === false
                        ? t('app:process-information.no')
                        : t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {loaderData.equityNeeded === true && (
                    <DescriptionListItem term={t('app:process-information.preferred-employment-equities')}>
                      {loaderData.employmentEquities ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>
                  )}
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hiring-manager-referral-requests.position-information')}
              linkLabel={t('app:hiring-manager-referral-requests.edit-position-information')}
              file="routes/hiring-manager/request/position-information.tsx"
              isComplete={loaderData.isCompletePositionInformation}
              isNew={loaderData.isPositionNew}
              params={params}
              required
              errorState={fetcher.data?.positionInfoComplete === false}
              showStatus
            >
              {loaderData.isPositionNew ? (
                <>{t('app:hiring-manager-referral-requests.position-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:position-information.position-number')}>
                    {loaderData.positionNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.group-and-level')}>
                    {loaderData.classification?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.title-en')}>
                    {loaderData.englishTitle ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.title-fr')}>
                    {loaderData.frenchTitle ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.locations')}>
                    {loaderData.cities === undefined
                      ? t('app:hiring-manager-referral-requests.not-provided')
                      : loaderData.cities.length > 0 && loaderData.cities.join(', ')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:position-information.language-profile')}>
                    {loaderData.languageRequirement?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {(loaderData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
                    loaderData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative) && (
                    <>
                      <DescriptionListItem term={t('app:position-information.english')}>
                        {loaderData.englishLanguageProfile ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>

                      <DescriptionListItem term={t('app:position-information.french')}>
                        {loaderData.frenchLanguageProfile ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>
                    </>
                  )}

                  <DescriptionListItem term={t('app:position-information.security-requirement')}>
                    {loaderData.securityClearance?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hiring-manager-referral-requests.somc-conditions')}
              linkLabel={t('app:hiring-manager-referral-requests.edit-somc-conditions')}
              file="routes/hiring-manager/request/somc-conditions.tsx"
              isComplete={loaderData.isCompleteStatementOfMeritCriteriaInformaion}
              isNew={loaderData.isStatementOfMeritCriteriaNew}
              params={params}
              required
              errorState={fetcher.data?.statementOfMeritCriteriaInfoComplete === false}
              showStatus
            >
              {loaderData.isStatementOfMeritCriteriaNew ? (
                <>{t('app:hiring-manager-referral-requests.somc-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:somc-conditions.english-somc-label')}>
                    {loaderData.englishStatementOfMerit ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:somc-conditions.french-somc-label')}>
                    {loaderData.frenchStatementOfMerit ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hiring-manager-referral-requests.submission-details')}
              linkLabel={t('app:hiring-manager-referral-requests.edit-submission-details')}
              file="routes/hiring-manager/request/submission-details.tsx"
              isComplete={loaderData.isCompleteSubmissionInformation}
              isNew={loaderData.isSubmissionNew}
              params={params}
              required
              errorState={fetcher.data?.submissionInfoComplete === false}
              showStatus
            >
              {loaderData.isSubmissionNew ? (
                <>{t('app:hiring-manager-referral-requests.submission-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:submission-details.submiter-title')}>
                    {loaderData.submitter ? (
                      <>
                        {loaderData.submitter.firstName} {loaderData.submitter.lastName}
                        <br />
                        {loaderData.submitter.businessEmailAddress}
                      </>
                    ) : (
                      t('app:hiring-manager-referral-requests.not-provided')
                    )}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.hiring-manager-title')}>
                    {loaderData.hiringManager ? (
                      <>
                        {loaderData.hiringManager.firstName} {loaderData.hiringManager.lastName}
                        <br />
                        {loaderData.hiringManager.businessEmailAddress}
                      </>
                    ) : (
                      t('app:hiring-manager-referral-requests.not-provided')
                    )}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.sub-delegate-title')}>
                    {loaderData.subDelegatedManager ? (
                      <>
                        {loaderData.subDelegatedManager.firstName} {loaderData.subDelegatedManager.lastName}
                        <br />
                        {loaderData.subDelegatedManager.businessEmailAddress}
                      </>
                    ) : (
                      t('app:hiring-manager-referral-requests.not-provided')
                    )}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.branch-or-service-canada-region')}>
                    {loaderData.directorate?.parent?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.directorate')}>
                    {loaderData.directorate?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                    {loaderData.languageOfCorrespondence?.name ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.additional-comments')}>
                    {loaderData.additionalComment ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>
          </div>

          <div className="mt-8 max-w-prose">
            <div className="flex justify-center">
              <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                <Button type="button" className="w-full" variant="alternative" id="cancel" onClick={() => setShowDialog(true)}>
                  {t('app:form.cancel')}
                </Button>

                <ButtonLink
                  className="mt-4 w-full"
                  variant="alternative"
                  file="routes/hiring-manager/index.tsx"
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
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('app:hiring-manager-referral-requests.request-cancel.title')}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{t('app:hiring-manager-referral-requests.request-cancel.content')}</DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button id="confirm-modal-back" variant="default" size="sm">
                {t('app:hiring-manager-referral-requests.request-cancel.keep')}
              </Button>
            </DialogClose>
            <fetcher.Form method="post" noValidate>
              <Button id="cancel-request" variant="primary" size="sm" name="_action" value="cancel" disabled={isSubmitting}>
                {t('app:hiring-manager-referral-requests.request-cancel.cancel')}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
