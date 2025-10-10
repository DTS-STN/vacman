import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getRequestService } from '~/.server/domain/services/request-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { countCompletedItems } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
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
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardEditLink,
  ProfileCardFooter,
  ProfileCardHeader,
  ProfileCardViewLink,
} from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
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
import { RequestSummaryCard } from '~/routes/page-components/requests/request-summary-card';
import { formatISODate } from '~/utils/date-utils';
import { trimToUndefined } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

type ActionErrorResult = {
  status: 'error';
  errorMessage?: string;
  errorCode?: string;
};

function isActionErrorResult(data: unknown): data is ActionErrorResult {
  return typeof data === 'object' && data !== null && 'status' in data && (data as { status?: unknown }).status === 'error';
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const formData = await request.formData();
  const formAction = formData.get('action');

  if (formAction === 'delete') {
    const { t } = await getTranslation(request, handle.i18nNamespace);

    if (requestData.status?.code !== REQUEST_STATUS_CODE.DRAFT) {
      return {
        status: 'error',
        errorMessage: t('app:hiring-manager-referral-requests.delete-request.not-allowed'),
        errorCode: 'REQUEST_DELETE_NOT_ALLOWED',
      };
    }

    const deleteRequest = await getRequestService().deleteRequestById(Number(params.requestId), session.authState.accessToken);

    if (deleteRequest.isErr()) {
      const error = deleteRequest.unwrapErr();
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
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
    priorityEntitlement: requestData.priorityEntitlement,
    workSchedule: requestData.workSchedule,
    ...(requestData.priorityEntitlement
      ? {
          priorityEntitlementRationale: requestData.priorityEntitlementRationale,
        }
      : {}),
    ...(requestData.selectionProcessType?.code === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.code ||
    requestData.selectionProcessType?.code === SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.code
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
    { eventType: REQUEST_EVENT_TYPE.submitted },
    session.authState.accessToken,
  );

  if (submitResult.isErr()) {
    const error = submitResult.unwrapErr();
    return {
      status: 'error',
      errorMessage: error.message,
      errorCode: error.errorCode,
    };
  }

  const updatedRequest = submitResult.unwrap();

  return {
    status: 'submitted',
    requestStatus: updatedRequest.status,
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  // Process information from Request type
  const requiredProcessInformation = {
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
    priorityEntitlement: requestData.priorityEntitlement,
    workSchedule: requestData.workSchedule,
    ...(requestData.priorityEntitlement
      ? {
          priorityEntitlementRationale: requestData.priorityEntitlementRationale,
        }
      : {}),
    ...(requestData.selectionProcessType?.code === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.code ||
    requestData.selectionProcessType?.code === SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.code
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
  const processInformationCompleted = countCompletedItems(requiredProcessInformation);
  const processInformationTotalFields = Object.keys(requiredProcessInformation).length;

  const languageProficiencyRequired =
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
    requestData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative;

  // Position information from Request type
  const requiredPositionInformation = {
    positionNumber: requestData.positionNumber,
    classification: requestData.classification,
    englishTitle: requestData.englishTitle,
    frenchTitle: requestData.frenchTitle,
    cities: requestData.cities,
    languageRequirement: requestData.languageRequirement,
    securityClearance: requestData.securityClearance,
    ...(languageProficiencyRequired
      ? {
          englishLanguageProfile: requestData.englishLanguageProfile,
          frenchLanguageProfile: requestData.frenchLanguageProfile,
        }
      : {}),
  };
  const positionInformationCompleted = countCompletedItems(requiredPositionInformation);
  const positionInformationTotalFields = Object.keys(requiredPositionInformation).length;

  // Statement of Merit and Conditions Information from Request type
  const requiredStatementOfMeritCriteriaInformation = {
    englishStatementOfMerit: requestData.englishStatementOfMerit,
    frenchStatementOfMerit: requestData.frenchStatementOfMerit,
  };

  const statementOfMeritCriteriaInformationCompleted = countCompletedItems(requiredStatementOfMeritCriteriaInformation);
  const statementOfMeritCriteriaInformationTotalFields = Object.keys(requiredStatementOfMeritCriteriaInformation).length;

  // Submission Information from Request type
  const requiredSubmissionInformation = {
    submitter: requestData.submitter,
    hiringManager: requestData.hiringManager,
    subDelegatedManager: requestData.subDelegatedManager,
    workUnit: requestData.workUnit,
    languageOfCorrespondence: requestData.languageOfCorrespondence,
  };

  const submissionInformationCompleted = countCompletedItems(requiredSubmissionInformation);
  const submissionInformationTotalFields = Object.keys(requiredSubmissionInformation).length;

  // Determine completeness
  const isCompleteProcessInformation = processInformationCompleted === processInformationTotalFields;
  const isCompletePositionInformation = positionInformationCompleted === positionInformationTotalFields;
  const isCompleteStatementOfMeritCriteriaInformaion =
    statementOfMeritCriteriaInformationCompleted === statementOfMeritCriteriaInformationTotalFields;
  const isCompleteSubmissionInformation = submissionInformationCompleted === submissionInformationTotalFields;

  const requestCompleted =
    processInformationCompleted +
    positionInformationCompleted +
    statementOfMeritCriteriaInformationCompleted +
    submissionInformationCompleted;
  const requestTotalFields =
    processInformationTotalFields +
    positionInformationTotalFields +
    statementOfMeritCriteriaInformationTotalFields +
    submissionInformationTotalFields;
  const amountCompleted = (requestCompleted / requestTotalFields) * 100;
  const employmentEquityNames = requestData.employmentEquities
    ?.map((eq) => (lang === 'en' ? eq.nameEn : eq.nameFr))
    .filter(Boolean) // Remove any null or undefined names
    .join(', ');

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
    selectionProcessType: lang === 'en' ? requestData.selectionProcessType?.nameEn : requestData.selectionProcessType?.nameEn,
    selectionProcessTypeCode: requestData.selectionProcessType?.code,
    hasPerformedSameDuties: requestData.hasPerformedSameDuties,
    appointmentNonAdvertised:
      lang === 'en' ? requestData.appointmentNonAdvertised?.nameEn : requestData.appointmentNonAdvertised?.nameFr,
    employmentTenure: lang === 'en' ? requestData.employmentTenure?.nameEn : requestData.employmentTenure?.nameFr,
    employmentTenureCode: requestData.employmentTenure?.code,
    projectedStartDate: requestData.projectedStartDate,
    projectedEndDate: requestData.projectedEndDate,
    workSchedule: lang === 'en' ? requestData.workSchedule?.nameEn : requestData.workSchedule?.nameFr,
    equityNeeded: requestData.equityNeeded,
    employmentEquities: employmentEquityNames,
    isCompletePositionInformation,
    isPositionNew: positionInformationCompleted === 0,
    positionNumber: requestData.positionNumber,
    classification: requestData.classification,
    englishTitle: requestData.englishTitle,
    frenchTitle: requestData.frenchTitle,
    cities: requestData.cities?.map((city) => ({
      province: lang === 'en' ? city.provinceTerritory.nameEn : city.provinceTerritory.nameFr,
      city: lang === 'en' ? city.nameEn : city.nameFr,
    })),
    languageRequirement: requestData.languageRequirement,
    englishLanguageProfile: requestData.englishLanguageProfile,
    frenchLanguageProfile: requestData.frenchLanguageProfile,
    isCompleteStatementOfMeritCriteriaInformaion,
    isStatementOfMeritCriteriaNew: statementOfMeritCriteriaInformationCompleted === 0,
    englishStatementOfMerit: requestData.englishStatementOfMerit,
    frenchStatementOfMerit: requestData.frenchStatementOfMerit,
    isCompleteSubmissionInformation,
    isSubmissionNew: submissionInformationCompleted === 0,
    submitter: requestData.submitter,
    hiringManager: requestData.hiringManager,
    subDelegatedManager: requestData.subDelegatedManager,
    branchOrServiceCanadaRegion: lang === 'en' ? requestData.workUnit?.parent?.nameEn : requestData.workUnit?.parent?.nameFr,
    directorate: lang === 'en' ? requestData.workUnit?.nameEn : requestData.workUnit?.nameFr,
    languageOfCorrespondence:
      lang === 'en' ? requestData.languageOfCorrespondence?.nameEn : requestData.languageOfCorrespondence?.nameFr,
    additionalComment: requestData.additionalComment,
    status: requestData.status,
    hrAdvisor: requestData.hrAdvisor,
    priorityClearanceNumber: requestData.priorityClearanceNumber,
    pscClearanceNumber: requestData.pscClearanceNumber,
    requestNumber: requestData.requestNumber,
    requestDate: requestData.createdDate,
    languageRequirementName: lang === 'en' ? requestData.languageRequirement?.nameEn : requestData.languageRequirement?.nameFr,
    securityClearanceName: lang === 'en' ? requestData.securityClearance?.nameEn : requestData.securityClearance?.nameFr,
    lang,
  };
}

export default function EditRequest({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const isDeleting = fetcherState.submitting && fetcherState.action === 'delete';
  const isDraft = loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT;

  const alertRef = useRef<HTMLDivElement>(null);

  if (fetcher.data && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (isDeleting && showDialog) {
      setShowDialog(false);
    }
  }, [isDeleting, showDialog]);

  const defaultDeleteErrorMessage = t('app:hiring-manager-referral-requests.delete-request.error-generic');

  function getAlertConfig() {
    if (!fetcher.data) return undefined;
    if (isActionErrorResult(fetcher.data)) {
      return {
        type: 'error' as const,
        message: fetcher.data.errorMessage ?? defaultDeleteErrorMessage,
      };
    }
    return {
      type: loaderData.isRequestComplete ? ('success' as const) : ('error' as const),
      message: loaderData.isRequestComplete
        ? t('app:hiring-manager-referral-requests.request-submitted')
        : t('app:hiring-manager-referral-requests.request-incomplete'),
    };
  }
  const alertConfig = getAlertConfig();

  type CityPreference = {
    province: string;
    city: string;
  };

  type GroupedCities = Record<string, string[]>;

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        {loaderData.status && (
          <RequestStatusTag status={loaderData.status} lang={loaderData.lang} rounded view="hiring-manager" />
        )}

        <PageTitle>{t('app:hiring-manager-referral-requests.page-title')}</PageTitle>

        {loaderData.status?.code !== REQUEST_STATUS_CODE.DRAFT && (
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
                  <div className="flex flex-col gap-1">
                    <span>{`${loaderData.hiringManager.firstName} ${loaderData.hiringManager.lastName}`}</span>
                    <span>{loaderData.hiringManager.businessEmailAddress}</span>
                  </div>
                ) : (
                  t('app:hiring-manager-referral-requests.not-provided')
                )}
              </DescriptionListItem>

              <DescriptionListItem
                className="ml-10 w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.hr-advisor')}
              >
                {loaderData.hrAdvisor ? (
                  <div className="flex flex-col gap-1">
                    <span>{`${loaderData.hrAdvisor.firstName} ${loaderData.hrAdvisor.lastName}`}</span>
                    <span>{loaderData.hrAdvisor.businessEmailAddress}</span>
                  </div>
                ) : (
                  t('app:hiring-manager-referral-requests.not-assigned')
                )}
              </DescriptionListItem>
            </DescriptionList>
          </div>
        )}
      </VacmanBackground>

      <BackLink
        id="back-to-requests"
        aria-label={t('app:hiring-manager-referral-requests.back')}
        file="routes/hiring-manager/requests.tsx"
        disabled={isSubmitting}
      >
        {t('app:hiring-manager-referral-requests.back')}
      </BackLink>

      {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
        <ContextualAlert type="info" role="status" ariaLive="polite">
          <div className="space-y-2 px-4">
            <p>{t('app:hiring-manager-referral-requests.notice-line-1')}</p>
            <ul className="list-inside list-disc">
              <li>{t('app:hiring-manager-referral-requests.notice-line-2')}</li>
              <li>{t('app:hiring-manager-referral-requests.notice-line-3')}</li>
              <li>{t('app:hiring-manager-referral-requests.notice-line-4')}</li>
              <li>{t('app:hiring-manager-referral-requests.notice-line-5')}</li>
            </ul>
            <p>{t('app:hiring-manager-referral-requests.notice-line-6')}</p>
            <p>{t('app:hiring-manager-referral-requests.notice-line-7')}</p>
          </div>
        </ContextualAlert>
      )}

      <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hiring-manager-referral-requests.request-details')}</h2>

      {alertConfig && (
        <AlertMessage ref={alertRef} type={alertConfig.type} message={alertConfig.message} role="alert" ariaLive="assertive" />
      )}

      <div className="w-full">
        {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
          <div className="text-black-800 mt-4 max-w-prose text-base">
            {t('app:hiring-manager-referral-requests.page-description')}
          </div>
        )}

        {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
          <div className="mt-4">
            <Progress
              className="color-[#2572B4] mt-8 mb-8"
              label={t('app:hiring-manager-referral-requests.request-completion-progress')}
              value={loaderData.amountCompleted}
            />
          </div>
        )}

        {loaderData.status && (
          <RequestSummaryCard
            priorityClearanceNumber={loaderData.priorityClearanceNumber}
            pscClearanceNumber={loaderData.pscClearanceNumber}
            requestStatus={loaderData.status}
            lang={loaderData.lang}
            view="hiring-manager"
            file="routes/hiring-manager/request/matches.tsx"
            params={params}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mt-8 max-w-prose space-y-10">
            <ProfileCard errorState={fetcher.data?.processInfoComplete === false}>
              <ProfileCardHeader
                required
                status={isDraft ? (loaderData.isCompleteProcessInformation ? 'complete' : 'in-progress') : undefined}
              >
                {t('app:hiring-manager-referral-requests.process-information')}
              </ProfileCardHeader>
              <ProfileCardContent>
                {loaderData.isProcessNew ? (
                  <>{t('app:hiring-manager-referral-requests.process-intro')}</>
                ) : (
                  <DescriptionList>
                    <DescriptionListItem term={t('app:hiring-manager-referral-requests.selection-process-number')}>
                      {loaderData.selectionProcessNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:process-information.approval-received')}>
                      {(() => {
                        if (loaderData.workforceMgmtApprovalRecvd === undefined) {
                          return t('app:hiring-manager-referral-requests.not-provided');
                        }
                        return loaderData.workforceMgmtApprovalRecvd ? t('gcweb:input-option.yes') : t('gcweb:input-option.no');
                      })()}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                      {loaderData.priorityEntitlement === true
                        ? t('app:process-information.yes')
                        : loaderData.priorityEntitlement === false
                          ? t('app:process-information.no')
                          : t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    {loaderData.priorityEntitlement === true && (
                      <DescriptionListItem term={t('app:process-information.rationale')}>
                        {loaderData.priorityEntitlementRationale ?? t('app:hiring-manager-referral-requests.not-provided')}
                      </DescriptionListItem>
                    )}

                    <DescriptionListItem term={t('app:process-information.selection-process-type')}>
                      {loaderData.selectionProcessType ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    {(loaderData.selectionProcessTypeCode === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.code ||
                      loaderData.selectionProcessTypeCode ===
                        SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.code) && (
                      <>
                        <DescriptionListItem term={t('app:process-information.performed-duties')}>
                          {loaderData.hasPerformedSameDuties === true
                            ? t('app:process-information.yes')
                            : loaderData.hasPerformedSameDuties === false
                              ? t('app:process-information.no')
                              : t('app:hiring-manager-referral-requests.not-provided')}
                        </DescriptionListItem>

                        <DescriptionListItem term={t('app:process-information.non-advertised-appointment')}>
                          {loaderData.appointmentNonAdvertised ?? t('app:hiring-manager-referral-requests.not-provided')}
                        </DescriptionListItem>
                      </>
                    )}

                    <DescriptionListItem term={t('app:process-information.employment-tenure')}>
                      {loaderData.employmentTenure ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    {loaderData.employmentTenureCode === EMPLOYMENT_TENURE.term && (
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
                      {loaderData.workSchedule ?? t('app:hiring-manager-referral-requests.not-provided')}
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
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isProcessNew}
                    file="routes/hiring-manager/request/process-information.tsx"
                    params={params}
                  >
                    {t('app:hiring-manager-referral-requests.edit-process-information')}
                  </ProfileCardEditLink>
                </ProfileCardFooter>
              )}
            </ProfileCard>

            <ProfileCard errorState={fetcher.data?.positionInfoComplete === false}>
              <ProfileCardHeader
                required
                status={isDraft ? (loaderData.isCompletePositionInformation ? 'complete' : 'in-progress') : undefined}
              >
                {t('app:hiring-manager-referral-requests.position-information')}
              </ProfileCardHeader>
              <ProfileCardContent>
                {loaderData.isPositionNew ? (
                  <>{t('app:hiring-manager-referral-requests.position-intro')}</>
                ) : (
                  <DescriptionList>
                    <DescriptionListItem term={t('app:position-information.position-number')}>
                      {loaderData.positionNumber
                        ? loaderData.positionNumber.split(',').join(', ')
                        : t('app:hiring-manager-referral-requests.not-provided')}
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
                        : loaderData.cities.length > 0 && (
                            <div>
                              {/* Group cities by province */}
                              {Object.entries(
                                (loaderData.cities as CityPreference[]).reduce((acc: GroupedCities, city: CityPreference) => {
                                  const provinceName = city.province;
                                  acc[provinceName] ??= [];
                                  acc[provinceName].push(city.city);
                                  return acc;
                                }, {} as GroupedCities),
                              ).map(([province, cities]) => (
                                <div key={province}>
                                  <strong>{province}:</strong> {cities.join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:position-information.language-profile')}>
                      {loaderData.languageRequirementName ?? t('app:hiring-manager-referral-requests.not-provided')}
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
                      {loaderData.securityClearanceName ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>
                  </DescriptionList>
                )}
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isPositionNew}
                    file="routes/hiring-manager/request/position-information.tsx"
                    params={params}
                  >
                    {t('app:hiring-manager-referral-requests.edit-position-information')}
                  </ProfileCardEditLink>
                </ProfileCardFooter>
              )}
            </ProfileCard>

            <ProfileCard errorState={fetcher.data?.statementOfMeritCriteriaInfoComplete === false}>
              <ProfileCardHeader
                required
                status={
                  isDraft ? (loaderData.isCompleteStatementOfMeritCriteriaInformaion ? 'complete' : 'in-progress') : undefined
                }
              >
                {t('app:hiring-manager-referral-requests.somc-conditions')}
              </ProfileCardHeader>
              <ProfileCardContent>
                {loaderData.isStatementOfMeritCriteriaNew ? (
                  <>{t('app:hiring-manager-referral-requests.somc-intro')}</>
                ) : (
                  <p className="font-medium">
                    {trimToUndefined(loaderData.englishStatementOfMerit) && trimToUndefined(loaderData.frenchStatementOfMerit)
                      ? t('app:somc-conditions.english-french-provided')
                      : t('app:hiring-manager-referral-requests.not-provided')}
                  </p>
                )}
              </ProfileCardContent>
              <ProfileCardFooter>
                {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT ? (
                  <ProfileCardEditLink
                    isNew={loaderData.isStatementOfMeritCriteriaNew}
                    file="routes/hiring-manager/request/somc-conditions.tsx"
                    params={params}
                  >
                    {t('app:hiring-manager-referral-requests.edit-somc-conditions')}
                  </ProfileCardEditLink>
                ) : (
                  <ProfileCardViewLink file="routes/hiring-manager/request/somc-conditions.tsx" params={params}>
                    {t('app:hiring-manager-referral-requests.edit-somc-conditions')}
                  </ProfileCardViewLink>
                )}
              </ProfileCardFooter>
            </ProfileCard>

            <ProfileCard errorState={fetcher.data?.submissionInfoComplete === false}>
              <ProfileCardHeader
                required
                status={isDraft ? (loaderData.isCompleteSubmissionInformation ? 'complete' : 'in-progress') : undefined}
              >
                {t('app:hiring-manager-referral-requests.submission-details')}
              </ProfileCardHeader>
              <ProfileCardContent>
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
                      {loaderData.branchOrServiceCanadaRegion ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:submission-details.directorate')}>
                      {loaderData.directorate ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                      {loaderData.languageOfCorrespondence ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>

                    <DescriptionListItem term={t('app:submission-details.additional-comments')}>
                      {loaderData.additionalComment ?? t('app:hiring-manager-referral-requests.not-provided')}
                    </DescriptionListItem>
                  </DescriptionList>
                )}
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isSubmissionNew}
                    file="routes/hiring-manager/request/submission-details.tsx"
                    params={params}
                  >
                    {t('app:hiring-manager-referral-requests.edit-submission-details')}
                  </ProfileCardEditLink>
                </ProfileCardFooter>
              )}
            </ProfileCard>
          </div>

          {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
            <div className="mt-8 max-w-prose">
              <div className="flex justify-center">
                <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                  <Button
                    type="button"
                    className="w-full"
                    variant="redAlternative"
                    id="delete"
                    onClick={() => setShowDialog(true)}
                  >
                    {t('app:hiring-manager-referral-requests.delete-request.delete')}
                  </Button>

                  <ButtonLink
                    className="mt-4 w-full"
                    variant="alternative"
                    file="routes/hiring-manager/requests.tsx"
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
          )}
        </div>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent aria-describedby="delete-dialog-description" role="alertdialog">
          <DialogHeader>
            <DialogTitle id="delete-dialog-title">{t('app:hiring-manager-referral-requests.delete-request.title')}</DialogTitle>
          </DialogHeader>
          <DialogDescription id="delete-dialog-description">
            {t('app:hiring-manager-referral-requests.delete-request.content')}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button id="confirm-modal-back" variant="alternative" disabled={isSubmitting}>
                {t('app:hiring-manager-referral-requests.delete-request.keep')}
              </Button>
            </DialogClose>
            <fetcher.Form method="post" noValidate>
              <Button id="delete-request" variant="red" name="action" value="delete" disabled={isSubmitting}>
                {t('app:hiring-manager-referral-requests.delete-request.delete')}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
