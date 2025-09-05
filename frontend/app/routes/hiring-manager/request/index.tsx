import { useEffect, useRef, useState } from 'react';

import type { RouteHandle } from 'react-router';
import { useActionData, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

//import { getCityService } from '~/.server/domain/services/city-service';
//import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getRequestService } from '~/.server/domain/services/request-service';
// TODO review

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { countCompletedItems } from '~/.server/utils/profile-utils';
import { AlertMessage } from '~/components/alert-message';
import { ButtonLink } from '~/components/button-link';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { LoadingButton } from '~/components/loading-button';
import { ProfileCard } from '~/components/profile-card';
import { Progress } from '~/components/progress';
import { StatusTag } from '~/components/status-tag';
//import { PROFILE_STATUS_CODE, EMPLOYEE_WFA_STATUS } from '~/domain/constants';
import { useFetcherState } from '~/hooks/use-fetcher-state';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { PageTitle } from '~/components/page-title';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

// TODO review
//export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // TODO review
  const requestData = await getRequestService().getRequestById(Number(params.requestId), context.session.authState.accessToken);
  const currentRequest = requestData.into();

  //
  // For process information, check required fields directly on ???
  // TODO review each field
  const requiredProcessFields = {
    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest?.priorityEntitlement,
    priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    selectionProcessType: currentRequest?.selectionProcessType,
    hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    appointmentNonAdvertised: currentRequest?.appointmentNonAdvertised,
    projectedStartDate: currentRequest?.projectedStartDate, // ISO date string (LocalDate)
    projectedEndDate: currentRequest?.projectedEndDate, // ISO date string (LocalDate)
    workSchedule: currentRequest?.workSchedule,
    equityNeeded: currentRequest?.equityNeeded,
    employmentEquities: currentRequest?.employmentEquities,
    positionNumber: currentRequest?.positionNumber, // Comma separated list
    classification: currentRequest?.classification,
    englishTitle: currentRequest?.englishTitle,
    frenchTitle: currentRequest?.frenchTitle,
    cities: currentRequest?.cities,
    languageRequirement: currentRequest?.languageRequirement,
    englishLanguageProfile: currentRequest?.englishLanguageProfile,
    frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    securityClearance: currentRequest?.securityClearance,
    englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
    status: currentRequest?.status,
    workUnit: currentRequest?.workUnit,
    submitter: currentRequest?.submitter,
    hiringManager: currentRequest?.hiringManager,
    subDelegatedManager: currentRequest?.subDelegatedManager,
    hrAdvisor: currentRequest?.hrAdvisor,
    languageOfCorrespondence: currentRequest?.languageOfCorrespondence,
    employmentTenure: currentRequest?.employmentTenure,
    priorityClearanceNumber: currentRequest?.priorityClearanceNumber,
    pscClearanceNumber: currentRequest?.pscClearanceNumber,
    requestNumber: currentRequest?.requestNumber,
    additionalComment: currentRequest?.additionalComment,
  };

  // For position information, check required fields directly on ???
  // TODO review each field
  const requiredPositionFields = {
    // classification: profileData.classification,
  };

  // For Statement of Merit Criteria and Conditions of Employment, use ???
  // TODO review each field
  const requiredSOMCFields = {
    // preferredLanguages: profileData.preferredLanguages,
  };

  // For Submission details, use ???
  // TODO review each field
  const submissionFields = {
    // preferredLanguages: profileData.preferredLanguages,
  };

  // Check if all sections are complete
  const processInfoComplete = countCompletedItems(requiredProcessFields) === Object.keys(requiredProcessFields).length;
  const positionInfoComplete = countCompletedItems(requiredPositionFields) === Object.keys(requiredPositionFields).length;
  const SOMCInfoComplete = countCompletedItems(requiredSOMCFields) === Object.keys(requiredSOMCFields).length;
  const submissionInfoComplete = countCompletedItems(submissionFields) === Object.keys(submissionFields).length;

  // If any section is incomplete, return incomplete state
  if (!processInfoComplete || !positionInfoComplete || !SOMCInfoComplete || !submissionInfoComplete) {
    return {
      processInfoComplete,
      positionInfoComplete,
      SOMCInfoComplete,
      submissionInfoComplete,
    };
  }

  // If all complete, submit for review  TODO review
  const submitResult = await getRequestService().updateRequestStatus(
    Number(params.requestId),
    currentRequest, //TODO
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
  // TODO review each field
  const processInformationData = {
    processInformationNumber: currentRequest?.selectionProcessNumber,
  };
  const requiredProcessInformation = processInformationData;
  const processInformationCompleted = countCompletedItems(requiredProcessInformation);
  const processInformationTotalFields = Object.keys(requiredProcessInformation).length; //TODO required?

  // Position information from Request type
  // TODO review each field
  const positionInformationData = {
    classification: currentRequest?.classification,
  };

  const requiredPositionInformation = positionInformationData;
  const positionInformationCompleted = countCompletedItems(requiredPositionInformation);
  const positionInformationTotalFields = Object.keys(requiredPositionInformation).length;

  // Statement of Merit and Conditions Information from Request type
  // TODO review each field
  const SOMCInformationData = {
    securityClearance: currentRequest?.securityClearance,
  };

  const requiredSOMCInformation = SOMCInformationData;
  const SOMCInformationCompleted = countCompletedItems(requiredSOMCInformation);
  const SOMCInformationTotalFields = Object.keys(requiredSOMCInformation).length;

  // Submission Information from Request type
  // TODO review each field
  const submissionInformationData = {
    securityClearance: currentRequest?.securityClearance,
  };

  const requiredSubmissionInformation = submissionInformationData;
  const submissionInformationCompleted = countCompletedItems(requiredSubmissionInformation);
  const submissionInformationTotalFields = Object.keys(requiredSubmissionInformation).length;

  // Determine completeness

  const isCompleteProcessInformation = processInformationCompleted === processInformationTotalFields;
  const isCompletePositionInformation = positionInformationCompleted === positionInformationTotalFields;
  const isCompleteSOMCInformaion = SOMCInformationCompleted === SOMCInformationTotalFields;
  const isCompleteSubmissionInformation = submissionInformationCompleted === submissionInformationTotalFields;

  const profileCompleted =
    processInformationCompleted + positionInformationCompleted + SOMCInformationCompleted + submissionInformationCompleted;
  const profileTotalFields =
    processInformationTotalFields +
    positionInformationTotalFields +
    SOMCInformationTotalFields +
    submissionInformationTotalFields;
  const amountCompleted = (profileCompleted / profileTotalFields) * 100;

  return {
    documentTitle: t('app:hiring-manager-referral-requests.page-title'),
    amountCompleted: amountCompleted,
    isProfileComplete:
      isCompleteProcessInformation &&
      isCompletePositionInformation &&
      isCompleteSOMCInformaion &&
      isCompleteSubmissionInformation,
    // process
    isCompleteProcessInformation,
    isProcessNew: processInformationCompleted === 0,
    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    // position
    isCompletePositionInformation,
    isPositionNew: positionInformationCompleted === 0,
    // somc
    isCompleteSOMCInformaion,
    isSOMCNew: SOMCInformationCompleted === 0,
    // submission
    isCompleteSubmissionInformation,
    isSubmissionNew: submissionInformationCompleted === 0,

    //TODO review each field
    // workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    // priorityEntitlement: currentRequest?.priorityEntitlement,
    // priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    // selectionProcessType: currentRequest?.selectionProcessType,
    // hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    // appointmentNonAdvertised: currentRequest?.appointmentNonAdvertised,
    // projectedStartDate: currentRequest?.projectedStartDate,  // ISO date string (LocalDate)
    // projectedEndDate: currentRequest?.projectedEndDate,      // ISO date string (LocalDate)
    // workSchedule: currentRequest?.workSchedule,
    // equityNeeded: currentRequest?.equityNeeded,
    // employmentEquities: currentRequest?.employmentEquities,
    positionNumber: currentRequest?.positionNumber, // Comma separated list
    // classification: currentRequest?.classification,
    // englishTitle: currentRequest?.englishTitle,
    // frenchTitle: currentRequest?.frenchTitle,
    // cities: currentRequest?.cities,
    // languageRequirement: currentRequest?.languageRequirement,
    // englishLanguageProfile: currentRequest?.englishLanguageProfile,
    // frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    // securityClearance: currentRequest?.securityClearance,
    // englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    // frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
    status: currentRequest?.status,
    // workUnit: currentRequest?.workUnit,
    // submitter: currentRequest?.submitter,
    // hiringManager: currentRequest?.hiringManager,
    // subDelegatedManager: currentRequest?.subDelegatedManager,
    // hrAdvisor: currentRequest?.hrAdvisor,
    // languageOfCorrespondence: currentRequest?.languageOfCorrespondence,
    // employmentTenure: currentRequest?.employmentTenure,
    // priorityClearanceNumber: currentRequest?.priorityClearanceNumber,
    // pscClearanceNumber: currentRequest?.pscClearanceNumber,
    // requestNumber: currentRequest?.requestNumber,
    // additionalComment: currentRequest?.additionalComment,

    // lastModifiedDate: profileData.lastModifiedDate ?? undefined,
    // lastUpdatedBy: profileUpdatedByUserName,
    hasRequestChanged,
    // baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    lang,
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

      <AlertMessage
        type={'info'}
        message={
          t('app:hiring-manager-referral-requests.page-info-1') +
          t('app:hiring-manager-referral-requests.page-info-2') +
          t('app:hiring-manager-referral-requests.page-info-3') +
          t('app:hiring-manager-referral-requests.page-info-4')
        }
        role="status"
        ariaLive="polite"
      />


      <div className="mt-20 w-full">
        <div className="flex w-full items-start space-x-4 border-l-6 border-[#2572B4] bg-blue-100 p-4">
          <div
            role="presentation"
            className="bg-[rgba(37, 114, 180,1)] h-28 w-1/24 bg-[url('/info-icon.svg')] bg-size-[28px] bg-left-top bg-no-repeat"
          />

          <div className="text-black-800 pl-1 text-xs">
            <p>{t('app:hiring-manager-referral-requests.page-info-1')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-2')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-3')}</p>
            <p className="mt-2">{t('app:hiring-manager-referral-requests.page-info-4')}</p>
          </div>
        </div>

        <h3 className="font-lato mt-4 text-xl font-bold">{t('app:hiring-manager-referral-requests.request-details')}</h3>

        <div className="text-black-800 mt-4 max-w-prose text-xs">
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
                  <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                    {loaderData.selectionProcessNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                  {/* TODO add more fields */}
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
                  <DescriptionListItem term={t('app:position-information.position-number')}>
                    {loaderData.positionNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                  {/* TODO add more fields */}
                </DescriptionList>
              )}
            </ProfileCard>

            <ProfileCard
              title={t('app:hiring-manager-referral-requests.somc-conditions')}
              linkLabel={t('app:hiring-manager-referral-requests.edit-somc-conditions')}
              file="routes/hiring-manager/request/somc-conditions.tsx"
              isComplete={loaderData.isCompleteSOMCInformaion}
              isNew={loaderData.isSOMCNew}
              params={params}
              required
              errorState={formActionData?.somcComplete === false} //TODO review
              showStatus
            >
              {loaderData.isSOMCNew ? (
                <>{t('app:hiring-manager-referral-requests.somc-intro')}</>
              ) : (
                <DescriptionList>
                  <DescriptionListItem term={t('app:position-information.position-number')}>
                    {/* // TODO Review */}
                    {loaderData.positionNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                  {/* TODO add more fields */}
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
                  <DescriptionListItem term={t('app:position-information.position-number')}>
                    {/* // TODO Review */}
                    {loaderData.positionNumber ?? t('app:hiring-manager-referral-requests.not-provided')}
                  </DescriptionListItem>
                  {/* TODO add more fields */}
                </DescriptionList>
              )}
            </ProfileCard>
          </div>

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
