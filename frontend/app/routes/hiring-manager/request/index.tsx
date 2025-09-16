import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useActionData, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getCityService } from '~/.server/domain/services/city-service';
// import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getRequestService } from '~/.server/domain/services/request-service';
// TODO review

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { countCompletedItems } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { StatusTag } from '~/components/status-tag';
import { LANGUAGE_REQUIREMENT_CODES } from '~/domain/constants';
//import { PROFILE_STATUS_CODE, EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

// TODO review below and delete what is not needed
//export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // TODO review data and formatting
  const requestData = await getRequestService().getRequestById(Number(params.requestId), context.session.authState.accessToken);
  const currentRequest = requestData.into();

  //
  // For process information from Request Model
  const requiredProcessFields = {
    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest?.priorityEntitlement,
    priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    selectionProcessType: currentRequest?.selectionProcessType,
    hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    appointmentNonAdvertised: currentRequest?.appointmentNonAdvertised,
    employmentTenure: currentRequest?.employmentTenure,
    projectedStartDate: currentRequest?.projectedStartDate, // ISO date string (LocalDate)
    projectedEndDate: currentRequest?.projectedEndDate, // ISO date string (LocalDate)
    workSchedule: currentRequest?.workSchedule,
    equityNeeded: currentRequest?.equityNeeded,
    employmentEquities: currentRequest?.employmentEquities,
  };

  // For position information from Request Model
  const requiredPositionFields = {
    positionNumber: currentRequest?.positionNumber, // Comma separated list
    classification: currentRequest?.classification,
    englishTitle: currentRequest?.englishTitle,
    frenchTitle: currentRequest?.frenchTitle,
    cities: currentRequest?.cities,
    languageRequirement: currentRequest?.languageRequirement,
    englishLanguageProfile: currentRequest?.englishLanguageProfile,
    frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    securityClearance: currentRequest?.securityClearance,
  };

  // For Statement of Merit Criteria and Conditions of Employment from Request Model
  const requiredStatementOfMeritCriteriaFields = {
    englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
  };

  // For Submission details from Request Model
  const submissionFields = {
    submitter: currentRequest?.submitter,
    hiringManager: currentRequest?.hiringManager,
    subDelegatedManager: currentRequest?.subDelegatedManager,
    workUnit: currentRequest?.workUnit,
    languageOfCorrespondence: currentRequest?.languageOfCorrespondence,
    additionalComment: currentRequest?.additionalComment,
  };

  // Other data fields from the Request Model not included in the sections above but needed for submission
  // const otherFields = {
  //   priorityClearanceNumber: currentRequest?.priorityClearanceNumber,
  //   pscClearanceNumber: currentRequest?.pscClearanceNumber,
  //   requestNumber: currentRequest?.requestNumber,
  //   status: currentRequest?.status,
  //   hrAdvisor: currentRequest?.hrAdvisor,
  // }

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

  // If all complete, submit for review  TODO review
  const submitResult = await getRequestService().updateRequestStatus(
    Number(params.requestId),
    currentRequest, //TODO review that currentRequest contains all the data required and as expected
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
    profileStatus: submitResult.unwrap(),
  };
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const requestResult = await getRequestService().getRequestById(
    Number(params.requestId),
    context.session.authState.accessToken,
  );
  const currentRequest = requestResult.into();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const url = new URL(request.url);
  const hasRequestChanged = url.searchParams.get('edited') === 'true';

  const allLocalizedCities = await getCityService().listAllLocalized(lang);

  //
  // TODO review next section remove what is not needed

  // Fetch reference data
  //   const [allClassifications, allLocalizedCities] = await Promise.all([
  //      getClassificationService().listAllLocalized(lang),
  //      getCityService().listAllLocalized(lang),
  //   ]);

  // Use profileUser for updated by information as well
  //   const profileUpdatedByUserName = `${currentRequest.firstName ?? 'Unknown'} ${currentRequest.lastName ?? 'User'}`;
  //   const profileStatus = profileData.profileStatus
  //     ? (await getProfileStatusService().findLocalizedById(profileData.profileStatus.id, lang)).unwrap()
  //     : { code: PROFILE_STATUS_CODE.incomplete, name: 'Incomplete' };
  //   const workUnitResult =
  //     profileData.substantiveWorkUnit !== undefined
  //       ? await getDirectorateService().findLocalizedById(profileData.substantiveWorkUnit.id, lang)
  //       : undefined;
  //   const substantivePositionResult =
  //     profileData.substantiveClassification !== undefined
  //       ? await getClassificationService().findLocalizedById(profileData.substantiveClassification.id, lang)
  //       : undefined;
  //   const cityResult =
  //     profileData.substantiveCity !== undefined
  //       ? await getCityService().findLocalizedById(profileData.substantiveCity.id, lang)
  //       : undefined;

  // convert the IDs to display names
  //   const substantivePosition = substantivePositionResult?.into()?.name;
  //   const branchOrServiceCanadaRegion = workUnitResult?.into()?.parent?.name;
  //   const directorate = workUnitResult?.into()?.name;
  //   const city = cityResult?.into();
  //   const hrAdvisors = await getHrAdvisors(context.session.authState.accessToken);  // needed?
  //   const submitter = hrAdvisors.find((u) => u.id === profileData.submitterId);
  //   const hiringManager = hrAdvisors.find((u) => u.id === profileData.hiringManagerId);
  //   const subDelegatedManager = hrAdvisors.find((u) => u.id === profileData.subDelegatedManagerId);
  //   const hrAdvisor = hrAdvisors.find((u) => u.id === profileData.hrAdvisorId);
  //   const languageReferralTypes = profileData.preferredLanguages
  //     ?.map((lang) => allLocalizedLanguageReferralTypes.find((l) => l.id === lang.id))
  //     .filter(Boolean);
  //   const classifications = profileData.preferredClassifications
  //     ?.map((classification) => allClassifications.find((c) => c.id === classification.id))
  //     .filter(Boolean);
  //   const cities = profileData.preferredCities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);

  // Check each section if the required fields are complete
  // Process information from Request type
  const processInformationData = {
    processInformationNumber: currentRequest?.selectionProcessNumber,
    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest?.priorityEntitlement,
    priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    selectionProcessType: currentRequest?.selectionProcessType,
    hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    appointmentNonAdvertised: currentRequest?.appointmentNonAdvertised,
    employmentTenure: currentRequest?.employmentTenure,
    projectedStartDate: currentRequest?.projectedStartDate, // formatted as ISO date string (LocalDate)
    projectedEndDate: currentRequest?.projectedEndDate, // formatted as ISO date string (LocalDate)
    workSchedule: currentRequest?.workSchedule,
    equityNeeded: currentRequest?.equityNeeded,
    employmentEquities: currentRequest?.employmentEquities,
  };
  const requiredProcessInformation = processInformationData;
  const processInformationCompleted = countCompletedItems(requiredProcessInformation);
  const processInformationTotalFields = Object.keys(requiredProcessInformation).length;

  // Position information from Request type
  const positionInformationData = {
    positionNumber: currentRequest?.positionNumber, // Comma separated list
    classification: currentRequest?.classification,
    englishTitle: currentRequest?.englishTitle,
    frenchTitle: currentRequest?.frenchTitle,
    cities: currentRequest?.cities,
    languageRequirement: currentRequest?.languageRequirement,
    englishLanguageProfile: currentRequest?.englishLanguageProfile,
    frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    securityClearance: currentRequest?.securityClearance,
  };

  const languageProficiencyRequired =
    currentRequest?.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
    currentRequest?.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative;

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
    englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
  };

  const requiredStatementOfMeritCriteriaInformation = statementOfMeritCriteriaInformationData;
  const statementOfMeritCriteriaInformationCompleted = countCompletedItems(requiredStatementOfMeritCriteriaInformation);
  const statementOfMeritCriteriaInformationTotalFields = Object.keys(requiredStatementOfMeritCriteriaInformation).length;

  // Submission Information from Request type
  const submissionInformationData = {
    submitter: currentRequest?.submitter,
    hiringManager: currentRequest?.hiringManager,
    subDelegatedManager: currentRequest?.subDelegatedManager,
    workUnit: currentRequest?.workUnit,
    languageOfCorrespondence: currentRequest?.languageOfCorrespondence,
    additionalComment: currentRequest?.additionalComment,
  };

  const requiredSubmissionInformation = submissionInformationData;
  const submissionInformationCompleted = countCompletedItems(requiredSubmissionInformation);
  const submissionInformationTotalFields = Object.keys(requiredSubmissionInformation).length;

  // Other data fields from the Request type not included in the sections above
  // const otherFields = {
  //   priorityClearanceNumber: currentRequest?.priorityClearanceNumber,
  //   pscClearanceNumber: currentRequest?.pscClearanceNumber,
  //   requestNumber: currentRequest?.requestNumber,
  //   status: currentRequest?.status,
  //   hrAdvisor: currentRequest?.hrAdvisor,
  // }

  // Determine completeness

  const isCompleteProcessInformation = processInformationCompleted === processInformationTotalFields;
  const isCompletePositionInformation = positionInformationCompleted === positionInformationTotalFields;
  const isCompleteStatementOfMeritCriteriaInformaion =
    statementOfMeritCriteriaInformationCompleted === statementOfMeritCriteriaInformationTotalFields; // Statement Of Merit Criteria
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
  const cities = currentRequest?.cities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);

  return {
    documentTitle: t('app:hiring-manager-referral-requests.page-title'),
    amountCompleted: amountCompleted,
    isProfileComplete:
      isCompleteProcessInformation &&
      isCompletePositionInformation &&
      isCompleteStatementOfMeritCriteriaInformaion &&
      isCompleteSubmissionInformation,
    //
    // process
    isCompleteProcessInformation,
    isProcessNew: processInformationCompleted === 0,

    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest?.priorityEntitlement,
    priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    selectionProcessType: currentRequest?.selectionProcessType,
    hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    appointmentNonAdvertised: currentRequest?.appointmentNonAdvertised,
    employmentTenure: currentRequest?.employmentTenure,
    projectedStartDate: currentRequest?.projectedStartDate, // formatted as ISO date string (LocalDate)
    projectedEndDate: currentRequest?.projectedEndDate, // formatted as ISO date string (LocalDate)
    workSchedule: currentRequest?.workSchedule,
    equityNeeded: currentRequest?.equityNeeded,
    employmentEquities: currentRequest?.employmentEquities,
    //
    // position
    isCompletePositionInformation,
    isPositionNew: positionInformationCompleted === 0,

    positionNumber: currentRequest?.positionNumber,
    classification: currentRequest?.classification,
    englishTitle: currentRequest?.englishTitle,
    frenchTitle: currentRequest?.frenchTitle,
    cities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
    languageRequirement: currentRequest?.languageRequirement,
    englishLanguageProfile: currentRequest?.englishLanguageProfile,
    frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    securityClearance: currentRequest?.securityClearance,
    //
    // Statement Of Merit Criteria
    isCompleteStatementOfMeritCriteriaInformaion,
    isStatementOfMeritCriteriaNew: statementOfMeritCriteriaInformationCompleted === 0,

    englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
    //
    // submission
    isCompleteSubmissionInformation,
    isSubmissionNew: submissionInformationCompleted === 0,

    submitter: currentRequest?.submitter,
    hiringManager: currentRequest?.hiringManager,
    subDelegatedManager: currentRequest?.subDelegatedManager,
    workUnit: currentRequest?.workUnit,
    languageOfCorrespondence: currentRequest?.languageOfCorrespondence,
    additionalComment: currentRequest?.additionalComment,

    // Other fields
    status: currentRequest?.status,
    hrAdvisor: currentRequest?.hrAdvisor,
    priorityClearanceNumber: currentRequest?.priorityClearanceNumber,
    pscClearanceNumber: currentRequest?.pscClearanceNumber,
    requestNumber: currentRequest?.requestNumber,
    hasRequestChanged,
    lang,

    // TODO review
    // lastModifiedDate: currentRequest.lastModifiedDate ?? undefined,
    // lastUpdatedBy: profileUpdatedByUserName,
    // baseTimeZone: serverEnvironment.BASE_TIMEZONE,
  };
}

export default function EditRequest({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const actionData = useActionData();
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  // Use fetcher.data instead of actionData since we're using fetcher.Form
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
        <StatusTag
          status={{
            code: 'DRAFT', // TODO review loaderData.status,
            name: 'Draft', // TODO adapt code below
            // name:
            //   loaderData.status === REQUEST_STATUS_CODE.draft
            //     ? t('app:hiring-manager.draft-status-request')
            //     : loaderData.status.name,
          }}
        />

        <PageTitle>{t('app:hiring-manager-referral-requests.page-title')}</PageTitle>

        {/* TODO review */}
        <p className="font-normal text-[#9FA3AD]">
          {/* {t('app:profile.last-updated', { date: browserTZ, name: loaderData.lastUpdatedBy })} */}
        </p>

        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-50 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>

      {/* TODO review alert messages below */}
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

        {/* {loaderData.status?.code === REQUEST.incomplete && (  TODO fix and delete lie below*/}
        {loaderData.status?.code !== undefined && (
          <div className="mt-4">
            <Progress className="color-[#2572B4] mt-8 mb-8" label="" value={loaderData.amountCompleted} />
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
              errorState={formActionData?.processComplete === false} //TODO review
              required
              showStatus
            >
              {loaderData.isProcessNew ? (
                <>{t('app:hiring-manager-referral-requests.process-intro')}</>
              ) : (
                <DescriptionList>
                  {/* TODO review All fields */}
                  <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                    {loaderData.selectionProcessNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {/* TODO review  */}
                  {/* <DescriptionListItem term={t('app:process-information.workforceMgmtApprovalRecvd')}>
                    {loaderData.workforceMgmtApprovalRecvd ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem> */}

                  <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                    {loaderData.priorityEntitlement ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.priority-entitlement-rationale')}>
                    {loaderData.priorityEntitlementRationale ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.selection-process-type')}>
                    {loaderData.selectionProcessType?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.performed-duties')}>
                    {loaderData.hasPerformedSameDuties ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {/* TODO review  */}
                  {/* <DescriptionListItem term={t('app:process-information.appointment-non-advertised')}>    
                      {loaderData.appointmentNonAdvertised?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem> */}

                  <DescriptionListItem term={t('app:process-information.employment-tenure')}>
                    {loaderData.employmentTenure?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.projected-start-date')}>
                    {loaderData.projectedStartDate ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.projected-end-date')}>
                    {loaderData.projectedEndDate ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:process-information.work-schedule')}>
                    {loaderData.workSchedule?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {/* TODO review  */}
                  {/* <DescriptionListItem term={t('app:process-information.equity-needed')}>    
                      {loaderData.equityNeeded ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem> */}

                  {/* TODO review  */}
                  {/* <DescriptionListItem term={t('app:process-information.employment-equities')}>    
                      {loaderData.employmentEquities ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem> */}
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
              errorState={formActionData?.positionComplete === false} //TODO review
              showStatus
            >
              {loaderData.isPositionNew ? (
                <>{t('app:hiring-manager-referral-requests.position-intro')}</>
              ) : (
                <DescriptionList>
                  {/* TODO review All fields */}
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

                  {loaderData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualImperative ||
                    (loaderData.languageRequirement?.code === LANGUAGE_REQUIREMENT_CODES.bilingualNonImperative && (
                      <>
                        <DescriptionListItem term={t('app:position-information.english')}>
                          {loaderData.englishLanguageProfile ?? t('app:hiring-manager-referral-requests.not-provided')}
                        </DescriptionListItem>

                        <DescriptionListItem term={t('app:position-information.french')}>
                          {loaderData.frenchLanguageProfile ?? t('app:hiring-manager-referral-requests.not-provided')}
                        </DescriptionListItem>
                      </>
                    ))}

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
              errorState={formActionData?.statementOfMeritCriteriaComplete === false} //TODO review
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
              errorState={formActionData?.submissionComplete === false} //TODO review
              showStatus
            >
              {loaderData.isSubmissionNew ? (
                <>{t('app:hiring-manager-referral-requests.submission-intro')}</>
              ) : (
                <DescriptionList>
                  {/* TODO review All fields */}
                  {/* TODO replace name*/}
                  <DescriptionListItem term={t('app:submission-details.hiring-manager.submitter')}>
                    {(loaderData.submitter?.firstName, loaderData.submitter?.lastName) ??
                      t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {/* TODO replace name*/}
                  <DescriptionListItem term={t('app:submission-details.hiring-manager-name')}>
                    {(loaderData.hiringManager?.firstName, loaderData.hiringManager?.lastName) ??
                      t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  {/* TODO replace name*/}
                  <DescriptionListItem term={t('app:submission-details.sub-delegate-name')}>
                    {(loaderData.subDelegatedManager?.firstName, loaderData.subDelegatedManager?.lastName) ??
                      t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.directorate')}>
                    {/* TODO review  */}
                    {/* {loaderData.workUnit ?? t('app:hiring-manager-referral-requests.not-provided')} */}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                    {loaderData.languageOfCorrespondence?.code ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>

                  <DescriptionListItem term={t('app:submission-details.additional-comments')}>
                    {loaderData.additionalComment ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                </DescriptionList>
              )}
            </ProfileCard>
          </div>

          {/* Second Column -  */}

          <div className="mt-8 max-w-prose">
            <div className="flex justify-center">
              <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                {/* TODO review route */}
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
