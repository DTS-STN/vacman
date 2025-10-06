import { useState } from 'react';
import type { JSX } from 'react';

import type { RouteHandle } from 'react-router';
import { useFetcher } from 'react-router';

import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
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
import { InputField } from '~/components/input-field';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { RequestStatusTag } from '~/components/status-tag';
import {
  EMPLOYMENT_TENURE,
  REQUEST_CATEGORY,
  REQUEST_EVENT_TYPE,
  REQUEST_STATUS_CODE,
  REQUEST_STATUSES,
  SELECTION_PROCESS_TYPE,
} from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
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

  const employmentEquityNames = currentRequest.employmentEquities
    ?.map((eq) => (lang === 'en' ? eq.nameEn : eq.nameFr))
    .filter(Boolean) // Remove any null or undefined names
    .join(', ');

  return {
    documentTitle: t('app:hr-advisor-referral-requests.page-title'),
    requestNumber: currentRequest.requestNumber,
    requestDate: currentRequest.createdDate,
    hiringManager: currentRequest.hiringManager,
    hrAdvisor: currentRequest.hrAdvisor,
    selectionProcessNumber: currentRequest.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest.priorityEntitlement,
    priorityEntitlementRationale: currentRequest.priorityEntitlementRationale,
    selectionProcessType:
      lang === 'en' ? currentRequest.selectionProcessType?.nameEn : currentRequest.selectionProcessType?.nameEn,
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
    cities: currentRequest.cities?.map((city) => ({
      province: lang === 'en' ? city.provinceTerritory.nameEn : city.provinceTerritory.nameFr,
      city: lang === 'en' ? city.nameEn : city.nameFr,
    })),
    languageRequirement: currentRequest.languageRequirement,
    englishLanguageProfile: currentRequest.englishLanguageProfile,
    frenchLanguageProfile: currentRequest.frenchLanguageProfile,
    securityClearance: currentRequest.securityClearance,
    englishStatementOfMerit: currentRequest.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest.frenchStatementOfMerit,
    submitter: currentRequest.submitter,
    subDelegatedManager: currentRequest.subDelegatedManager,
    branchOrServiceCanadaRegion:
      lang === 'en' ? currentRequest.workUnit?.parent?.nameEn : currentRequest.workUnit?.parent?.nameFr,
    directorate: lang === 'en' ? currentRequest.workUnit?.nameEn : currentRequest.workUnit?.nameFr,
    languageOfCorrespondence:
      lang === 'en' ? currentRequest.languageOfCorrespondence?.nameEn : currentRequest.languageOfCorrespondence?.nameFr,
    additionalComment: currentRequest.additionalComment,
    status: currentRequest.status,
    lang,
    isRequestAssignedToCurrentUser: currentUser.id === currentRequest.hrAdvisor?.id,
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

  const formData = await request.formData();
  const formAction = formData.get('action');

  if (formAction === 'cancel-request') {
    const cancelRequest = await getRequestService().cancelRequestById(requestData.id, session.authState.accessToken);

    if (cancelRequest.isErr()) {
      const error = cancelRequest.unwrapErr();
      return {
        status: 'error',
        errorMessage: error.message,
        errorCode: error.errorCode,
      };
    }
  }

  if (formAction === 'pickup-request') {
    const submitResult = await getRequestService().updateRequestStatus(
      requestData.id,
      { eventType: REQUEST_EVENT_TYPE.pickedUp },
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

  return undefined;
}

export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const { t: tGcweb } = useTranslation('gcweb');
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  type CityPreference = {
    province: string;
    city: string;
  };

  type GroupedCities = Record<string, string[]>;
  const [showCancelRequestDialog, setShowCancelRequestDialog] = useState(false);
  const [showReAssignDialog, setShowReAssignDialog] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        {loaderData.status && (
          <RequestStatusTag status={loaderData.status} lang={loaderData.lang} rounded view={'hr-advisor'} />
        )}

        <PageTitle>{t('app:hr-advisor-referral-requests.page-title')}</PageTitle>

        <div>
          <DescriptionList className="flex">
            <DescriptionListItem
              className="mr-10 w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
              term={t('app:hr-advisor-referral-requests.request-id')}
            >
              {loaderData.requestNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="mx-10 w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
              term={t('app:hr-advisor-referral-requests.request-date')}
            >
              {loaderData.requestDate ?? t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>

            <DescriptionListItem
              className="mx-10 w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
              term={t('app:hr-advisor-referral-requests.hiring-manager')}
            >
              {loaderData.hiringManager ? (
                <>
                  {`${loaderData.hiringManager.firstName} ${loaderData.hiringManager.lastName}`}
                  <br />
                  {loaderData.hiringManager.businessEmailAddress}
                </>
              ) : (
                t('app:hr-advisor-referral-requests.not-provided')
              )}
            </DescriptionListItem>

            <DescriptionListItem
              className="ml-10 w-min whitespace-nowrap"
              ddClassName="mt-1 text-white sm:col-span-2 sm:mt-0"
              term={t('app:hr-advisor-referral-requests.hr-advisor')}
            >
              {loaderData.hrAdvisor
                ? `${loaderData.hrAdvisor.firstName} ${loaderData.hrAdvisor.lastName}`
                : t('app:hr-advisor-referral-requests.not-provided')}
            </DescriptionListItem>
          </DescriptionList>
        </div>

        <div
          role="presentation"
          className="absolute top-25 left-0 -z-10 h-70 w-full scale-x-[-1] bg-[rgba(9,28,45,1)] bg-[url('/VacMan-design-element-06.svg')] bg-size-[450px] bg-left-bottom bg-no-repeat"
        />
      </div>
      <BackLink
        id="back-to-requests"
        aria-label={t('app:hr-advisor-referral-requests.back')}
        className="mt-6"
        file="routes/hr-advisor/requests.tsx"
        disabled={isSubmitting}
      >
        {t('app:hr-advisor-referral-requests.back')}
      </BackLink>
      <div className="w-full">
        <h2 className="font-lato mt-4 text-xl font-bold">{t('app:hr-advisor-referral-requests.request-details')}</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="mt-8 max-w-prose space-y-10">
            <ProfileCard title={t('app:hr-advisor-referral-requests.process-information')} params={params}>
              <DescriptionList>
                <DescriptionListItem term={t('app:process-information.selection-process-number')}>
                  {loaderData.selectionProcessNumber ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.approval-received')}>
                  {(() => {
                    if (loaderData.workforceMgmtApprovalRecvd === undefined) {
                      return t('app:hr-advisor-referral-requests.not-provided');
                    }
                    return loaderData.workforceMgmtApprovalRecvd ? tGcweb('input-option.yes') : tGcweb('input-option.no');
                  })()}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
                  {(() => {
                    if (loaderData.priorityEntitlement === undefined) {
                      return t('app:hr-advisor-referral-requests.not-provided');
                    }
                    return loaderData.priorityEntitlement ? tGcweb('input-option.yes') : tGcweb('input-option.no');
                  })()}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.rationale')}>
                  {loaderData.priorityEntitlementRationale ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.selection-process-type')}>
                  {loaderData.selectionProcessType ?? t('app:hiring-manager-referral-requests.not-provided')}
                </DescriptionListItem>

                {(loaderData.selectionProcessTypeCode === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.code ||
                  loaderData.selectionProcessTypeCode === SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.code) && (
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
                  {loaderData.employmentTenure ?? t('app:hr-advisor-referral-requests.not-provided')}
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
                  {loaderData.workSchedule ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.employment-equity-identified-alt')}>
                  {(() => {
                    if (loaderData.equityNeeded === undefined) {
                      return t('app:hr-advisor-referral-requests.not-provided');
                    }
                    return loaderData.equityNeeded ? tGcweb('input-option.yes') : tGcweb('input-option.no');
                  })()}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.preferred-employment-equities')}>
                  {loaderData.employmentEquities ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>
              </DescriptionList>
            </ProfileCard>

            <ProfileCard title={t('app:hr-advisor-referral-requests.position-information')} params={params}>
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

                <DescriptionListItem term={t('app:position-information.language-requirement')}>
                  {loaderData.languageRequirement?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
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

            <ProfileCard title={t('app:hr-advisor-referral-requests.somc-conditions')} params={params}>
              <span className="flex items-center gap-x-2">
                <FontAwesomeIcon icon={faEye} />
                <InlineLink className="font-semibold" file="routes/hr-advisor/request/somc-conditions.tsx" params={params}>
                  {t('app:hr-advisor-referral-requests.somc-conditions-link')}
                </InlineLink>
              </span>
            </ProfileCard>

            <ProfileCard title={t('app:hr-advisor-referral-requests.submission-details')} params={params}>
              <DescriptionList>
                <DescriptionListItem term={t('app:submission-details.submiter-title')}>
                  {loaderData.submitter ? (
                    <>
                      {`${loaderData.submitter.firstName} ${loaderData.submitter.lastName}`}
                      <br />
                      {loaderData.submitter.businessEmailAddress}
                    </>
                  ) : (
                    t('app:hr-advisor-referral-requests.not-provided')
                  )}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.hiring-manager-title')}>
                  {loaderData.hiringManager ? (
                    <>
                      {`${loaderData.hiringManager.firstName} ${loaderData.hiringManager.lastName}`}
                      <br />
                      {loaderData.hiringManager.businessEmailAddress}
                    </>
                  ) : (
                    t('app:hr-advisor-referral-requests.not-provided')
                  )}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.sub-delegate-title')}>
                  {loaderData.subDelegatedManager ? (
                    <>
                      {`${loaderData.subDelegatedManager.firstName} ${loaderData.subDelegatedManager.lastName}`}
                      <br />
                      {loaderData.subDelegatedManager.businessEmailAddress}
                    </>
                  ) : (
                    t('app:hr-advisor-referral-requests.not-provided')
                  )}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.branch-or-service-canada-region')}>
                  {loaderData.branchOrServiceCanadaRegion ?? t('app:hiring-manager-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.directorate')}>
                  {loaderData.directorate ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:submission-details.preferred-language-of-correspondence')}>
                  {loaderData.languageOfCorrespondence ?? t('app:hr-advisor-referral-requests.not-provided')}
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
                <RenderButtonsByStatus
                  code={loaderData.status?.code}
                  isRequestAssignedToCurrentUser={loaderData.isRequestAssignedToCurrentUser}
                  isSubmitting={isSubmitting}
                  onCancelRequestClick={() => setShowCancelRequestDialog(true)}
                  onReAssignClick={() => setShowReAssignDialog(true)}
                />
              </fetcher.Form>
            </div>
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
            {t('app:hr-advisor-referral-requests.re-assign-request.content')}
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button id="confirm-modal-back" variant="alternative" disabled={isSubmitting}>
                {t('app:form.cancel')}
              </Button>
            </DialogClose>
            <fetcher.Form method="post" noValidate>
              <Button
                id="re-assign-request"
                variant="primary"
                name="action"
                value="re-assign"
                disabled={isSubmitting}
                onClick={() => setShowReAssignDialog(false)}
              >
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
  isRequestAssignedToCurrentUser: boolean;
  isSubmitting: boolean;
  onCancelRequestClick: () => void;
  onReAssignClick: () => void;
}

function RenderButtonsByStatus({
  code,
  isRequestAssignedToCurrentUser,
  isSubmitting,
  onCancelRequestClick,
  onReAssignClick,
}: RenderButtonsByStatusProps): JSX.Element {
  const { t } = useTranslation('app');

  const isActiveRequest = REQUEST_STATUSES.some((s) => s.code === code && s.category === REQUEST_CATEGORY.active);

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
    case REQUEST_STATUS_CODE.PENDING_PSC_NO_VMS:
    case REQUEST_STATUS_CODE.PENDING_PSC:
      return (
        <div className="flex flex-col">
          <Button className="w-full" variant="alternative" id="cancel-request" onClick={onCancelRequestClick}>
            {t('form.cancel-request')}
          </Button>

          <InputField
            className="w-full"
            id="psc-clearance-number"
            name="pscClearanceNumber"
            label={t('hr-advisor-referral-requests.psc-clearance-number')}
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
