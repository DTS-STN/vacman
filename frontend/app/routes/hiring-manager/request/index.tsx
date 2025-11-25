import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getCityService } from '~/.server/domain/services/city-service';
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
import { InlineLink } from '~/components/links';
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
import { SectionErrorSummary } from '~/components/section-error-summary';
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
import { useSaveSuccessMessage } from '~/hooks/use-save-success-message';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import PositionInformationSection from '~/routes/page-components/requests/position-information-section';
import ProcessInformationSection from '~/routes/page-components/requests/process-information-section';
import { RequestSummaryCard } from '~/routes/page-components/requests/request-summary-card';
import SomcConditionsSection from '~/routes/page-components/requests/somc-conditions-section';
import SubmissionDetailSection from '~/routes/page-components/requests/submission-detail-section';
import { formatISODate } from '~/utils/date-utils';
import { calculateLocationScope } from '~/utils/location-utils';
import { formatWithMask } from '~/utils/string-utils';

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

    return i18nRedirect('routes/hiring-manager/requests.tsx', request, {
      search: new URLSearchParams({ success: 'delete-request' }),
    });
  }

  // For process information from Request Model
  const requiredProcessFields = {
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
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
    isRequestComplete: true,
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

  const allLocalizedCities = await getCityService().listAllLocalized(lang);

  // Process information from Request type
  const requiredProcessInformation = {
    workforceMgmtApprovalRecvd: requestData.workforceMgmtApprovalRecvd,
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

  // Display Canada wide or province wide or list of cities on referral preferences section
  const preferredCityIds = new Set(requestData.cities?.map((city) => city.id) ?? []);
  const { locationScope, provinceNames, partiallySelectedCities } = calculateLocationScope(
    preferredCityIds,
    allLocalizedCities,
  );

  return {
    documentTitle:
      requestData.status?.code === REQUEST_STATUS_CODE.DRAFT
        ? t('app:hiring-manager-referral-requests.create-title')
        : t('app:hiring-manager-referral-requests.page-title'),
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
    preferredCities: partiallySelectedCities,
    locationScope,
    provinceNames,
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
    additionalContact: requestData.additionalContact,
    branchOrServiceCanadaRegion: lang === 'en' ? requestData.workUnit?.parent?.nameEn : requestData.workUnit?.parent?.nameFr,
    directorate: lang === 'en' ? requestData.workUnit?.nameEn : requestData.workUnit?.nameFr,
    languageOfCorrespondence:
      lang === 'en' ? requestData.languageOfCorrespondence?.nameEn : requestData.languageOfCorrespondence?.nameFr,
    additionalComment: requestData.additionalComment,
    status: requestData.status,
    hrAdvisor: requestData.hrAdvisor,
    priorityClearanceNumber: requestData.priorityClearanceNumber,
    pscClearanceNumber: requestData.pscClearanceNumber,
    requestId: formatWithMask(requestData.id, '####-####-##'),
    requestDate: requestData.createdDate,
    languageRequirementName: lang === 'en' ? requestData.languageRequirement?.nameEn : requestData.languageRequirement?.nameFr,
    securityClearanceName: lang === 'en' ? requestData.securityClearance?.nameEn : requestData.securityClearance?.nameFr,
    hasMatches: requestData.hasMatches,
    lang,
    backLinkSearchParams: new URL(request.url).searchParams.toString(),
  };
}

export default function EditRequest({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const isDeleting = fetcherState.submitting && fetcherState.action === 'delete';
  const isDraft = loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT;

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const alertRef = useRef<HTMLDivElement>(null);

  const successMessage = useSaveSuccessMessage({
    searchParams,
    location,
    navigate,
    i18nNamespace: handle.i18nNamespace,
    fetcherData: fetcher.data,
  });

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
    if (fetcher.data.isRequestComplete) {
      return {
        type: 'success' as const,
        message: t('app:hiring-manager-referral-requests.request-submitted'),
      };
    }
  }
  const alertConfig = getAlertConfig();

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        <div aria-live="polite" aria-atomic="true">
          {loaderData.status && (
            <RequestStatusTag status={loaderData.status} lang={loaderData.lang} rounded view="hiring-manager" />
          )}
        </div>

        <PageTitle>
          {isDraft
            ? t('app:hiring-manager-referral-requests.create-title')
            : t('app:hiring-manager-referral-requests.page-title')}
        </PageTitle>

        {loaderData.status?.code !== REQUEST_STATUS_CODE.DRAFT && (
          <div>
            <DescriptionList className="grid:cols-1 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:flex md:flex-wrap md:space-x-10">
              <DescriptionListItem
                className="w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.request-id')}
              >
                {loaderData.requestId}
              </DescriptionListItem>

              <DescriptionListItem
                className="w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.request-date')}
              >
                {loaderData.requestDate ? formatISODate(loaderData.requestDate) : t('app:referral-requests.not-provided')}
              </DescriptionListItem>

              <DescriptionListItem
                className="w-min whitespace-nowrap"
                ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
                term={t('app:hiring-manager-referral-requests.hiring-manager')}
              >
                {loaderData.hiringManager ? (
                  <div className="flex flex-col gap-1">
                    <span>{`${loaderData.hiringManager.firstName} ${loaderData.hiringManager.lastName}`}</span>
                    <span>{loaderData.hiringManager.businessEmailAddress}</span>
                  </div>
                ) : (
                  t('app:referral-requests.not-provided')
                )}
              </DescriptionListItem>

              <DescriptionListItem
                className="w-min whitespace-nowrap"
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
        params={params}
        search={new URLSearchParams(loaderData.backLinkSearchParams)}
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
            <p>
              <Trans
                i18nKey="app:hiring-manager-referral-requests.notice-line-7"
                components={{
                  InlineLink: (
                    <InlineLink
                      newTabIndicator
                      className="external-link text-sky-800 decoration-slate-400"
                      to={t('app:hiring-manager-referral-requests.priority-clearance-href')}
                      lang={loaderData.lang}
                    />
                  ),
                }}
              />
            </p>
          </div>
        </ContextualAlert>
      )}

      <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hiring-manager-referral-requests.request-details')}</h2>

      {alertConfig && (
        <AlertMessage ref={alertRef} type={alertConfig.type} message={alertConfig.message} role="alert" ariaLive="assertive" />
      )}
      {successMessage && (
        <AlertMessage ref={alertRef} type="success" message={successMessage} role="alert" ariaLive="assertive" />
      )}
      {fetcher.data && (
        <SectionErrorSummary
          sectionCompleteness={{
            processInformationComplete: fetcher.data.processInfoComplete,
            positionInformationComplete: fetcher.data.positionInfoComplete,
            statementOfMeritCriteriaInformationComplete: fetcher.data.statementOfMeritCriteriaInfoComplete,
            submissionInformationComplete: fetcher.data.submissionInfoComplete,
          }}
        />
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
              className="mt-8 mb-8"
              progressClassName="color-[#2572B4]"
              label={t('app:hiring-manager-referral-requests.request-completion-progress')}
              value={loaderData.amountCompleted}
            />
          </div>
        )}

        {loaderData.status && (
          <RequestSummaryCard
            hasMatches={loaderData.hasMatches}
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
                <ProcessInformationSection {...loaderData} />
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isProcessNew}
                    file="routes/hiring-manager/request/process-information.tsx"
                    params={params}
                    sectionId="process-information-section"
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
                <PositionInformationSection {...loaderData} />
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isPositionNew}
                    file="routes/hiring-manager/request/position-information.tsx"
                    params={params}
                    sectionId="position-information-section"
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
                <SomcConditionsSection {...loaderData} />
              </ProfileCardContent>
              <ProfileCardFooter>
                {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT ? (
                  <ProfileCardEditLink
                    isNew={loaderData.isStatementOfMeritCriteriaNew}
                    file="routes/hiring-manager/request/somc-conditions.tsx"
                    params={params}
                    sectionId="somc-information-section"
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
                <SubmissionDetailSection {...loaderData} />
              </ProfileCardContent>
              {loaderData.status?.code === REQUEST_STATUS_CODE.DRAFT && (
                <ProfileCardFooter>
                  <ProfileCardEditLink
                    isNew={loaderData.isSubmissionNew}
                    file="routes/hiring-manager/request/submission-details.tsx"
                    params={params}
                    sectionId="submission-information-section"
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
        <DialogContent aria-describedby="delete-dialog-description" aria-labelledby="delete-dialog-title" role="alertdialog">
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
