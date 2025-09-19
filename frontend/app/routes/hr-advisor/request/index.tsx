import { useActionData, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { getCityService } from '~/.server/domain/services/city-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { ButtonLink } from '~/components/button-link';
import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { InlineLink } from '~/components/links';
import { LoadingButton } from '~/components/loading-button';
import { PageTitle } from '~/components/page-title';
import { ProfileCard } from '~/components/profile-card';
import { StatusTag } from '~/components/status-tag';
import { PROFILE_STATUS_CODE, REQUEST_STATUSES } from '~/domain/constants';
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
  requireAuthentication(context.session, request);

  const requestResult = await getRequestService().getRequestById(
    Number(params.requestId),
    context.session.authState.accessToken,
  );

  const currentRequest = requestResult.into();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const [
    allLocalizedCities,
    allLocalizedProcessTypes,
    allLocalizedAppointmentNonAdvertised,
    allLocalizedTenures,
    allLocalizedWorkSchedules,
    allLocalizedEmploymentEquities,
    allLocalizedDirectorates,
    allLocalizedPreferredLanguage,
  ] = await Promise.all([
    getCityService().listAllLocalized(lang),
    getSelectionProcessTypeService().listAllLocalized(lang),
    getNonAdvertisedAppointmentService().listAllLocalized(lang),
    getEmploymentTenureService().listAllLocalized(lang),
    getWorkScheduleService().listAllLocalized(lang),
    getEmploymentEquityService().listAllLocalized(lang),
    getDirectorateService().listAllLocalized(lang),
    getLanguageForCorrespondenceService().listAllLocalized(lang),
  ]);

  const cities = currentRequest?.cities?.map((city) => allLocalizedCities.find((c) => c.id === city.id)).filter(Boolean);
  const employmentEquities = currentRequest?.employmentEquities
    ?.map((eq) => allLocalizedEmploymentEquities.find((e) => e.code === eq.code))
    .filter(Boolean);

  return {
    documentTitle: t('app:hr-advisor-referral-requests.page-title'),
    requestNumber: currentRequest?.requestNumber,
    requestDate: currentRequest?.createdDate,
    hiringManager: currentRequest?.hiringManager,
    hrAdvisor: currentRequest?.hrAdvisor,
    selectionProcessNumber: currentRequest?.selectionProcessNumber,
    workforceMgmtApprovalRecvd: currentRequest?.workforceMgmtApprovalRecvd,
    priorityEntitlement: currentRequest?.priorityEntitlement,
    priorityEntitlementRationale: currentRequest?.priorityEntitlementRationale,
    selectionProcessType: allLocalizedProcessTypes.find((s) => s.code === currentRequest?.selectionProcessType?.code),
    hasPerformedSameDuties: currentRequest?.hasPerformedSameDuties,
    appointmentNonAdvertised: allLocalizedAppointmentNonAdvertised.find(
      (a) => a.code === currentRequest?.appointmentNonAdvertised?.code,
    ),
    employmentTenure: allLocalizedTenures.find((t) => t.code === currentRequest?.employmentTenure?.code),
    projectedStartDate: currentRequest?.projectedStartDate,
    projectedEndDate: currentRequest?.projectedEndDate,
    workSchedule: allLocalizedWorkSchedules.find((w) => w.code === currentRequest?.workSchedule?.code),
    equityNeeded: currentRequest?.equityNeeded,
    employmentEquities: employmentEquities?.map((eq) => eq?.name).join(', '),
    positionNumber: currentRequest?.positionNumber,
    classification: currentRequest?.classification,
    englishTitle: currentRequest?.englishTitle,
    frenchTitle: currentRequest?.frenchTitle,
    cities: cities?.map((city) => city?.provinceTerritory.name + ' - ' + city?.name),
    languageRequirement: currentRequest?.languageRequirement,
    englishLanguageProfile: currentRequest?.englishLanguageProfile,
    frenchLanguageProfile: currentRequest?.frenchLanguageProfile,
    securityClearance: currentRequest?.securityClearance,
    englishStatementOfMerit: currentRequest?.englishStatementOfMerit,
    frenchStatementOfMerit: currentRequest?.frenchStatementOfMerit,
    submitter: currentRequest?.submitter,
    subDelegatedManager: currentRequest?.subDelegatedManager,
    directorate: allLocalizedDirectorates.find((c) => c.code === currentRequest?.workUnit?.code),
    languageOfCorrespondence: allLocalizedPreferredLanguage.find(
      (p) => p.code === currentRequest?.languageOfCorrespondence?.code,
    ),
    additionalComment: currentRequest?.additionalComment,
    status: currentRequest?.status,
    lang,
  };
}

export function action({ context, params, request }: Route.ActionArgs) {
  //TODO add action logic
  return undefined;
}

export default function HiringManagerRequestIndex({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const { t: tGcweb } = useTranslation('gcweb');
  const actionData = useActionData();
  const fetcher = useFetcher();
  const fetcherState = useFetcherState(fetcher);
  const isSubmitting = fetcherState.submitting;

  function getStatus(status: typeof loaderData.status) {
    switch (status?.id) {
      case 1: //SUBMIT
        return {
          code: PROFILE_STATUS_CODE.pending,
          name: t('app:hr-advisor-referral-requests.status.request-pending-approval'),
        };
      case 2: //HR_REVIEW
        return {
          code: PROFILE_STATUS_CODE.pending,
          name: t('app:hr-advisor-referral-requests.status.assigned-hr-review'),
        };
      default:
        return { code: PROFILE_STATUS_CODE.pending, name: 'undefined' };
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 py-8 text-white">
        <StatusTag status={getStatus(loaderData.status)} />

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

      <div className="mt-20 w-full">
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
                  {loaderData.selectionProcessType?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.performed-duties')}>
                  {(() => {
                    if (loaderData.hasPerformedSameDuties === undefined) {
                      return t('app:hr-advisor-referral-requests.not-provided');
                    }
                    return loaderData.hasPerformedSameDuties ? tGcweb('input-option.yes') : tGcweb('input-option.no');
                  })()}
                </DescriptionListItem>

                <DescriptionListItem term={t('app:process-information.non-advertised-appointment')}>
                  {loaderData.appointmentNonAdvertised?.name ?? t('app:hr-advisor-referral-requests.not-provided')}
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
                    : loaderData.cities.length > 0 && loaderData.cities.join(', ')}
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

                <DescriptionListItem term={t('app:submission-details.directorate')}>
                  {loaderData.directorate?.code ?? t('app:hr-advisor-referral-requests.not-provided')}
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
                {loaderData.status?.code === REQUEST_STATUSES[1].code ? ( //Status: SUBMIT
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
                      className="mt-4 w-full"
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
