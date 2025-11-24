import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { data, useFetcher, useLocation, useNavigate, useSearchParams } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/index';

import type { RequestUpdateModel } from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { mapRequestToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { AlertMessage } from '~/components/alert-message';
import { BackLink } from '~/components/back-link';
import { Button } from '~/components/button';
import { ButtonLink } from '~/components/button-link';
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
import { ActionDataErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
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
import { RequestStatusTag } from '~/components/status-tag';
import { VacmanBackground } from '~/components/vacman-background';
import type { RequestEventType } from '~/domain/constants';
import { REQUEST_CATEGORY, REQUEST_EVENT_TYPE, REQUEST_STATUS_CODE, REQUEST_STATUSES } from '~/domain/constants';
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
import type { Errors } from '~/routes/page-components/requests/validation.server';
import { formatISODate } from '~/utils/date-utils';
import { calculateLocationScope } from '~/utils/location-utils';
import { REGEX_PATTERNS } from '~/utils/regex-utils';
import { formatWithMask, formString } from '~/utils/string-utils';
import { extractValidationKey } from '~/utils/validation-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const currentRequest = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!currentRequest) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const allLocalizedCities = await getCityService().listAllLocalized(lang);

  const employmentEquityNames = currentRequest.employmentEquities
    ?.map((eq) => (lang === 'en' ? eq.nameEn : eq.nameFr))
    .filter(Boolean) // Remove any null or undefined names
    .join(', ');

  // Display Canada wide or province wide or list of cities on referral preferences section
  const preferredCityIds = new Set(currentRequest.cities?.map((city) => city.id) ?? []);
  const { locationScope, provinceNames, partiallySelectedCities } = calculateLocationScope(
    preferredCityIds,
    allLocalizedCities,
  );

  return {
    documentTitle: t('app:hr-advisor-referral-requests.page-title'),
    requestId: formatWithMask(currentRequest.id, '####-####-##'),
    requestDate: currentRequest.createdDate,
    hiringManager: currentRequest.hiringManager,
    hrAdvisor: currentRequest.hrAdvisor,
    selectionProcessNumber: currentRequest.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest.priorityEntitlement,
    priorityEntitlementRationale: currentRequest.priorityEntitlementRationale,
    pscClearanceNumber: currentRequest.pscClearanceNumber,
    priorityClearanceNumber: currentRequest.priorityClearanceNumber,
    selectionProcessType:
      lang === 'en' ? currentRequest.selectionProcessType?.nameEn : currentRequest.selectionProcessType?.nameFr,
    selectionProcessTypeCode: currentRequest.selectionProcessType?.code,
    hasPerformedSameDuties: currentRequest.hasPerformedSameDuties,
    appointmentNonAdvertised:
      lang === 'en' ? currentRequest.appointmentNonAdvertised?.nameEn : currentRequest.appointmentNonAdvertised?.nameFr,
    employmentTenure: lang === 'en' ? currentRequest.employmentTenure?.nameEn : currentRequest.employmentTenure?.nameFr,
    employmentTenureCode: currentRequest.employmentTenure?.code,
    projectedStartDate: currentRequest.projectedStartDate,
    projectedEndDate: currentRequest.projectedEndDate,
    workSchedule: lang === 'en' ? currentRequest.workSchedule?.nameEn : currentRequest.workSchedule?.nameFr,
    equityNeeded: currentRequest.equityNeeded,
    employmentEquities: employmentEquityNames,
    positionNumber: currentRequest.positionNumber,
    classification: currentRequest.classification,
    englishTitle: currentRequest.englishTitle,
    frenchTitle: currentRequest.frenchTitle,
    preferredCities: partiallySelectedCities,
    locationScope,
    provinceNames,
    languageRequirement: currentRequest.languageRequirement,
    englishLanguageProfile: currentRequest.englishLanguageProfile,
    frenchLanguageProfile: currentRequest.frenchLanguageProfile,
    securityClearance: currentRequest.securityClearance,
    englishStatementOfMerit: currentRequest.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest.frenchStatementOfMerit,
    submitter: currentRequest.submitter,
    subDelegatedManager: currentRequest.subDelegatedManager,
    additionalContact: currentRequest.additionalContact,
    branchOrServiceCanadaRegion:
      lang === 'en' ? currentRequest.workUnit?.parent?.nameEn : currentRequest.workUnit?.parent?.nameFr,
    directorate: lang === 'en' ? currentRequest.workUnit?.nameEn : currentRequest.workUnit?.nameFr,
    languageOfCorrespondence:
      lang === 'en' ? currentRequest.languageOfCorrespondence?.nameEn : currentRequest.languageOfCorrespondence?.nameFr,
    additionalComment: currentRequest.additionalComment,
    status: currentRequest.status,
    hasMatches: currentRequest.hasMatches,
    languageRequirementName:
      lang === 'en' ? currentRequest.languageRequirement?.nameEn : currentRequest.languageRequirement?.nameFr,
    securityClearanceName: lang === 'en' ? currentRequest.securityClearance?.nameEn : currentRequest.securityClearance?.nameFr,
    lang,
    isRequestAssignedToCurrentUser: currentUser.id === currentRequest.hrAdvisor?.id,
    backLinkSearchParams: new URL(request.url).searchParams.toString(),
  };
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

  // Helper function to update request status with common error handling
  async function updateRequestStatus(eventType: string, requestId: number, accessToken: string) {
    const submitResult = await getRequestService().updateRequestStatus(
      requestId,
      { eventType: eventType as RequestEventType },
      accessToken,
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

  const formData = await request.formData();

  switch (formData.get('action')) {
    case 'cancel-request': {
      const cancelRequest = await getRequestService().cancelRequestById(requestData.id, session.authState.accessToken);

      if (cancelRequest.isErr()) {
        const error = cancelRequest.unwrapErr();
        return {
          status: 'error',
          errorMessage: error.message,
          errorCode: error.errorCode,
        };
      }
      break;
    }

    case 'pickup-request': {
      return await updateRequestStatus(REQUEST_EVENT_TYPE.pickedUp, requestData.id, session.authState.accessToken);
    }

    case 'vms-not-required': {
      return await updateRequestStatus(REQUEST_EVENT_TYPE.vmsNotRequired, requestData.id, session.authState.accessToken);
    }

    case 'psc-clearance-required': {
      return await updateRequestStatus(REQUEST_EVENT_TYPE.pscRequired, requestData.id, session.authState.accessToken);
    }

    case 'psc-clearance-not-required': {
      return await updateRequestStatus(REQUEST_EVENT_TYPE.pscNotRequired, requestData.id, session.authState.accessToken);
    }

    case 'run-matches': {
      const submitResult = await getRequestService().runMatches(requestData.id, session.authState.accessToken);

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

    case 'psc-clearance-received': {
      const parseResult = v.safeParse(
        v.object({
          pscClearanceNumber: v.pipe(
            v.string('app:hr-advisor-referral-requests.errors.psc-clearance-number-required'),
            v.trim(),
            v.nonEmpty('app:hr-advisor-referral-requests.errors.psc-clearance-number-required'),
            v.length(11, 'app:hr-advisor-referral-requests.errors.psc-clearance-number-invalid'),
            v.regex(REGEX_PATTERNS.DIGIT_ONLY, 'app:hr-advisor-referral-requests.errors.psc-clearance-number-invalid'),
          ),
        }),
        {
          pscClearanceNumber: formString(formData.get('pscClearanceNumber')),
        },
      );

      if (!parseResult.success) {
        return data({ errors: v.flatten(parseResult.issues).nested }, { status: HttpStatusCodes.BAD_REQUEST });
      }

      const requestPayload: RequestUpdateModel = mapRequestToUpdateModelWithOverrides(requestData, {
        pscClearanceNumber: parseResult.output.pscClearanceNumber,
      });

      const updateResult = await getRequestService().updateRequestById(
        requestData.id,
        requestPayload,
        session.authState.accessToken,
      );

      if (updateResult.isErr()) {
        throw updateResult.unwrapErr();
      }

      return await updateRequestStatus(REQUEST_EVENT_TYPE.complete, requestData.id, session.authState.accessToken);
    }

    case 're-assign-request': {
      const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
      const currentUser = currentUserData.unwrap();
      const requestPayload: RequestUpdateModel = mapRequestToUpdateModelWithOverrides(requestData, {
        hrAdvisorId: currentUser.id,
      });

      const updateResult = await getRequestService().updateRequestById(
        requestData.id,
        requestPayload,
        session.authState.accessToken,
      );

      if (updateResult.isErr()) {
        throw updateResult.unwrapErr();
      }

      const updatedRequest = updateResult.unwrap();

      return {
        status: 'submitted',
        requestStatus: updatedRequest.status,
      };
    }
  }

  return undefined;
}

export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcher = useFetcher<typeof action>();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;
  const isReassigning = fetcherState.submitting && fetcherState.action === 're-assign-request';

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

  const [showCancelRequestDialog, setShowCancelRequestDialog] = useState(false);
  const [showReAssignDialog, setShowReAssignDialog] = useState(false);

  useEffect(() => {
    if (isReassigning && showReAssignDialog) {
      setShowReAssignDialog(false);
    }
  }, [isReassigning, showReAssignDialog]);

  const alertConfig: Record<string, { type: 'success' | 'info'; message: string }> = {
    [REQUEST_STATUS_CODE.PSC_GRANTED]: {
      type: 'success',
      message: t('app:hr-advisor-referral-requests.psc-clearance-received'),
    },
    [REQUEST_STATUS_CODE.NO_MATCH_HR_REVIEW]: {
      type: 'info',
      message: t('app:hr-advisor-referral-requests.no-match-found-alert-msg'),
    },
    [REQUEST_STATUS_CODE.PENDING_PSC]: {
      type: 'success',
      message: t('app:hr-advisor-referral-requests.pending-psc-clearance-alert-msg'),
    },
    [REQUEST_STATUS_CODE.CLR_GRANTED]: {
      type: 'success',
      message: t('app:hr-advisor-referral-requests.clearance-generated-alert-msg'),
    },
  };

  const statusCode = loaderData.status?.code;
  const currentAlert = statusCode ? alertConfig[statusCode] : undefined;

  return (
    <div className="space-y-8">
      <VacmanBackground variant="bottom-right">
        <div aria-live="polite" aria-atomic="true">
          {loaderData.status && (
            <RequestStatusTag status={loaderData.status} lang={loaderData.lang} rounded view="hr-advisor" />
          )}
        </div>

        <PageTitle>{t('app:hr-advisor-referral-requests.page-title')}</PageTitle>

        <div>
          <DescriptionList className="grid:cols-1 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:flex md:flex-wrap md:space-x-10">
            <DescriptionListItem
              className="w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2"
              term={t('app:hr-advisor-referral-requests.request-id')}
            >
              {loaderData.requestId}
            </DescriptionListItem>

            <DescriptionListItem
              className="w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2"
              term={t('app:hr-advisor-referral-requests.request-date')}
            >
              {loaderData.requestDate ? formatISODate(loaderData.requestDate) : t('app:referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2"
              term={t('app:hr-advisor-referral-requests.hiring-manager')}
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
              ddClassName="mt-1 text-white sm:col-span-2"
              term={t('app:hr-advisor-referral-requests.hr-advisor')}
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
      </VacmanBackground>
      <BackLink
        id="back-to-requests"
        aria-label={t('app:hr-advisor-referral-requests.back')}
        file="routes/hr-advisor/requests.tsx"
        disabled={isSubmitting}
        params={params}
        search={new URLSearchParams(loaderData.backLinkSearchParams)}
      >
        {t('app:hr-advisor-referral-requests.back')}
      </BackLink>

      <h2 className="font-lato mt-2 text-2xl font-bold">{t('app:hr-advisor-referral-requests.request-details')}</h2>

      {currentAlert && (
        <AlertMessage
          ref={alertRef}
          type={currentAlert.type}
          message={currentAlert.message}
          role="alert"
          ariaLive="assertive"
        />
      )}

      {successMessage && (
        <AlertMessage ref={alertRef} type="success" message={successMessage} role="alert" ariaLive="assertive" />
      )}

      {loaderData.status && (
        <RequestSummaryCard
          hasMatches={loaderData.hasMatches}
          priorityClearanceNumber={loaderData.priorityClearanceNumber}
          pscClearanceNumber={loaderData.pscClearanceNumber}
          requestStatus={loaderData.status}
          lang={loaderData.lang}
          view="hr-advisor"
          file="routes/hr-advisor/request/matches.tsx"
          params={params}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="max-w-prose space-y-10">
          <ProfileCard>
            <ProfileCardHeader>{t('app:hr-advisor-referral-requests.process-information')}</ProfileCardHeader>
            <ProfileCardContent>
              <ProcessInformationSection {...loaderData} />
            </ProfileCardContent>
            {loaderData.isRequestAssignedToCurrentUser && (
              <ProfileCardFooter>
                <ProfileCardEditLink file="routes/hr-advisor/request/process-information.tsx" params={params}>
                  {t('app:hiring-manager-referral-requests.edit-process-information')}
                </ProfileCardEditLink>
              </ProfileCardFooter>
            )}
          </ProfileCard>

          <ProfileCard>
            <ProfileCardHeader>{t('app:hr-advisor-referral-requests.position-information')}</ProfileCardHeader>
            <ProfileCardContent>
              <PositionInformationSection {...loaderData} />
            </ProfileCardContent>
            {loaderData.isRequestAssignedToCurrentUser && (
              <ProfileCardFooter>
                <ProfileCardEditLink file="routes/hr-advisor/request/position-information.tsx" params={params}>
                  {t('app:hiring-manager-referral-requests.edit-position-information')}
                </ProfileCardEditLink>
              </ProfileCardFooter>
            )}
          </ProfileCard>

          <ProfileCard>
            <ProfileCardHeader>{t('app:hr-advisor-referral-requests.somc-conditions')}</ProfileCardHeader>
            <ProfileCardContent>
              <SomcConditionsSection {...loaderData} />
            </ProfileCardContent>

            <ProfileCardFooter>
              {loaderData.isRequestAssignedToCurrentUser ? (
                <ProfileCardEditLink file="routes/hr-advisor/request/somc-conditions.tsx" params={params}>
                  {t('app:hiring-manager-referral-requests.edit-somc-conditions')}
                </ProfileCardEditLink>
              ) : (
                <ProfileCardViewLink file="routes/hr-advisor/request/somc-conditions.tsx" params={params}>
                  {t('app:hiring-manager-referral-requests.edit-somc-conditions')}
                </ProfileCardViewLink>
              )}
            </ProfileCardFooter>
          </ProfileCard>

          <ProfileCard>
            <ProfileCardHeader>{t('app:hr-advisor-referral-requests.submission-details')}</ProfileCardHeader>
            <ProfileCardContent>
              <SubmissionDetailSection {...loaderData} />
            </ProfileCardContent>
            {loaderData.isRequestAssignedToCurrentUser && (
              <ProfileCardFooter>
                <ProfileCardEditLink file="routes/hr-advisor/request/submission-details.tsx" params={params}>
                  {t('app:hiring-manager-referral-requests.edit-submission-details')}
                </ProfileCardEditLink>
              </ProfileCardFooter>
            )}
          </ProfileCard>
        </div>

        <div className="max-w-prose">
          <div className="flex justify-center">
            <ActionDataErrorSummary actionData={fetcher.data}>
              <fetcher.Form className="mt-6 md:mt-auto" method="post" noValidate>
                <RenderButtonsByStatus
                  code={loaderData.status?.code}
                  formErrors={fetcher.data && 'errors' in fetcher.data ? fetcher.data.errors : undefined}
                  isRequestAssignedToCurrentUser={loaderData.isRequestAssignedToCurrentUser}
                  isSubmitting={isSubmitting}
                  onCancelRequestClick={() => setShowCancelRequestDialog(true)}
                  onReAssignClick={() => setShowReAssignDialog(true)}
                />
              </fetcher.Form>
            </ActionDataErrorSummary>
          </div>
        </div>
      </div>

      <Dialog open={showCancelRequestDialog} onOpenChange={setShowCancelRequestDialog}>
        <DialogContent aria-describedby="cancel-request-dialog-description" role="alertdialog">
          <DialogHeader>
            <DialogTitle id="cancel-request-dialog-title">
              {t('app:hr-advisor-referral-requests.cancel-request.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="cancel-request-dialog-description">
            {t('app:hr-advisor-referral-requests.cancel-request.content')}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button id="confirm-modal-back" variant="alternative" disabled={isSubmitting}>
                {t('app:hr-advisor-referral-requests.cancel-request.continue')}
              </Button>
            </DialogClose>
            <fetcher.Form method="post" noValidate>
              <Button
                id="cancel-request-request"
                variant="primary"
                name="action"
                value="cancel-request"
                disabled={isSubmitting}
                onClick={() => setShowCancelRequestDialog(false)}
              >
                {t('app:hr-advisor-referral-requests.cancel-request.cancel-and-exit')}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showReAssignDialog} onOpenChange={setShowReAssignDialog}>
        <DialogContent aria-describedby="re-assign-dialog-description" role="alertdialog">
          <DialogHeader>
            <DialogTitle id="re-assign-dialog-title">
              {t('app:hr-advisor-referral-requests.re-assign-request.title')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="re-assign-dialog-description">
            {t('app:hr-advisor-referral-requests.re-assign-request.content', {
              'current-hr-advisor-name': `${loaderData.hrAdvisor?.firstName} ${loaderData.hrAdvisor?.lastName}`,
            })}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button id="confirm-modal-back" variant="alternative" disabled={isSubmitting}>
                {t('app:form.cancel')}
              </Button>
            </DialogClose>
            <fetcher.Form method="post" noValidate>
              <Button id="re-assign-request" variant="primary" name="action" value="re-assign-request" disabled={isSubmitting}>
                {t('app:hr-advisor-referral-requests.re-assign-request.reassign')}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RenderButtonsByStatusProps {
  code?: string;
  formErrors?: Errors;
  isRequestAssignedToCurrentUser: boolean;
  isSubmitting: boolean;
  onCancelRequestClick: () => void;
  onReAssignClick: () => void;
}

function RenderButtonsByStatus({
  code,
  formErrors,
  isRequestAssignedToCurrentUser,
  isSubmitting,
  onCancelRequestClick,
  onReAssignClick,
}: RenderButtonsByStatusProps): JSX.Element {
  const { t } = useTranslation('app');

  const isActiveRequest = REQUEST_STATUSES.some((s) => s.code === code && s.category === REQUEST_CATEGORY.active);

  // Always show PSC input section for these statuses
  if (code === REQUEST_STATUS_CODE.PENDING_PSC_NO_VMS || code === REQUEST_STATUS_CODE.PENDING_PSC) {
    return (
      <div className="flex flex-col">
        <Button className="mb-8 w-full" variant="alternative" id="cancel-request" onClick={onCancelRequestClick}>
          {t('form.cancel-request')}
        </Button>

        <InputField
          className="w-full"
          id="psc-clearance-number"
          name="pscClearanceNumber"
          label={t('hr-advisor-referral-requests.psc-clearance-number')}
          errorMessage={t(extractValidationKey(formErrors?.pscClearanceNumber?.[0]))}
          required
        />

        <Button
          className="mt-4 w-full"
          name="action"
          variant="primary"
          id="psc-clearance-received"
          disabled={isSubmitting}
          value="psc-clearance-received"
        >
          {t('form.psc-clearance-received')}
        </Button>
      </div>
    );
  }

  // Re-assign only shows up for HR advisors who haven't picked up that request
  if (!isRequestAssignedToCurrentUser && code !== REQUEST_STATUS_CODE.SUBMIT && isActiveRequest) {
    return (
      <LoadingButton
        className="w-full"
        name="action"
        variant="primary"
        id="re-assign-to-me"
        disabled={isSubmitting}
        loading={isSubmitting}
        value="re-assign-to-me"
        onClick={onReAssignClick}
      >
        {t('form.re-assign-to-me')}
      </LoadingButton>
    );
  }

  switch (code) {
    case REQUEST_STATUS_CODE.SUBMIT:
      return (
        <LoadingButton
          className="w-full"
          name="action"
          variant="primary"
          id="pickup-request"
          disabled={isSubmitting}
          loading={isSubmitting}
          value="pickup-request"
        >
          {t('form.pickup-request')}
        </LoadingButton>
      );
    case REQUEST_STATUS_CODE.HR_REVIEW:
      return (
        <div className="flex flex-col">
          <Button className="w-full" variant="alternative" id="cancel-request" onClick={onCancelRequestClick}>
            {t('form.cancel-request')}
          </Button>

          <ButtonLink
            className="mt-4 w-full"
            variant="alternative"
            file="routes/hr-advisor/requests.tsx"
            id="save"
            disabled={isSubmitting}
          >
            {t('form.save-and-exit')}
          </ButtonLink>

          <LoadingButton
            className="mt-4 w-full"
            name="action"
            variant="primary"
            id="vms-not-required"
            disabled={isSubmitting}
            loading={isSubmitting}
            value="vms-not-required"
          >
            {t('form.vms-not-required')}
          </LoadingButton>

          <LoadingButton
            className="mt-4 w-full"
            name="action"
            variant="primary"
            id="run-matches"
            disabled={isSubmitting}
            loading={isSubmitting}
            value="run-matches"
          >
            {t('form.run-matches')}
          </LoadingButton>
        </div>
      );

    case REQUEST_STATUS_CODE.FDBK_PENDING:
      return (
        <div className="flex flex-col">
          <Button className="w-full" variant="alternative" id="cancel-request" onClick={onCancelRequestClick}>
            {t('form.cancel-request')}
          </Button>
          <ButtonLink
            className="mt-4 w-full"
            variant="alternative"
            file="routes/hr-advisor/requests.tsx"
            id="save"
            disabled={isSubmitting}
          >
            {t('form.save-and-exit')}
          </ButtonLink>
        </div>
      );

    case REQUEST_STATUS_CODE.NO_MATCH_HR_REVIEW:
    case REQUEST_STATUS_CODE.FDBK_PEND_APPR:
      return (
        <div className="flex flex-col">
          <Button className="w-full" variant="alternative" id="cancel-request" onClick={onCancelRequestClick}>
            {t('form.cancel-request')}
          </Button>
          <ButtonLink
            className="mt-4 w-full"
            variant="alternative"
            file="routes/hr-advisor/requests.tsx"
            id="save"
            disabled={isSubmitting}
          >
            {t('form.save-and-exit')}
          </ButtonLink>
          <LoadingButton
            className="mt-4 w-full"
            name="action"
            variant="primary"
            id="psc-clearance-required"
            disabled={isSubmitting}
            loading={isSubmitting}
            value="psc-clearance-required"
          >
            {t('form.psc-clearance-required')}
          </LoadingButton>
          <LoadingButton
            className="mt-4 w-full"
            name="action"
            variant="primary"
            id="psc-clearance-not-required"
            disabled={isSubmitting}
            loading={isSubmitting}
            value="psc-clearance-not-required"
          >
            {t('form.psc-clearance-not-required')}
          </LoadingButton>
        </div>
      );
    default:
      return <></>;
  }
}
