import { useTranslation } from 'react-i18next';

import { DescriptionList, DescriptionListItem } from '~/components/description-list';
import { EMPLOYMENT_TENURE, SELECTION_PROCESS_TYPE } from '~/domain/constants';

interface BaseProps {
  selectionProcessNumber: string | undefined;
  workforceMgmtApprovalRecvd: boolean | undefined;
  priorityEntitlement: boolean | undefined;
  priorityEntitlementRationale: string | undefined;
  selectionProcessType: string | undefined;
  selectionProcessTypeCode: string | undefined;
  hasPerformedSameDuties: boolean | undefined;
  appointmentNonAdvertised: string | undefined;
  employmentTenure: string | undefined;
  employmentTenureCode: string | undefined;
  projectedStartDate: string | undefined;
  projectedEndDate: string | undefined;
  workSchedule: string | undefined;
  equityNeeded: boolean | undefined;
  employmentEquities: string | undefined;
}

interface HiringManagerProps extends BaseProps {
  view: 'hiring-manager';
  isProcessNew?: boolean;
}

interface HrAdvisorProps extends BaseProps {
  view: 'hr-advisor';
  isProcessNew?: never;
}

type ProcessInformationSectionProps = HiringManagerProps | HrAdvisorProps;

export default function ProcessInformationSection({
  view,
  isProcessNew,
  selectionProcessNumber,
  workforceMgmtApprovalRecvd,
  priorityEntitlement,
  priorityEntitlementRationale,
  selectionProcessType,
  selectionProcessTypeCode,
  hasPerformedSameDuties,
  appointmentNonAdvertised,
  employmentTenure,
  employmentTenureCode,
  projectedStartDate,
  projectedEndDate,
  workSchedule,
  equityNeeded,
  employmentEquities,
}: ProcessInformationSectionProps) {
  const { t } = useTranslation(['gcweb', 'app']);

  return (
    <>
      {isProcessNew ? (
        <>{t('app:referral-requests.process-intro')}</>
      ) : (
        <DescriptionList>
          <DescriptionListItem
            term={
              view === 'hr-advisor'
                ? t('app:process-information.selection-process-number')
                : t('app:referral-requests.selection-process-number')
            }
          >
            {selectionProcessNumber ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:process-information.approval-received')}>
            {workforceMgmtApprovalRecvd === true
              ? t('app:process-information.yes')
              : workforceMgmtApprovalRecvd === false
                ? t('app:process-information.no')
                : t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:process-information.priority-entitlement')}>
            {priorityEntitlement === true
              ? t('app:process-information.yes')
              : priorityEntitlement === false
                ? t('app:process-information.no')
                : t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          {priorityEntitlement === true && (
            <DescriptionListItem term={t('app:process-information.rationale')}>
              {priorityEntitlementRationale ?? t('app:referral-requests.not-provided')}
            </DescriptionListItem>
          )}

          <DescriptionListItem term={t('app:process-information.selection-process-type')}>
            {selectionProcessType ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          {(selectionProcessTypeCode === SELECTION_PROCESS_TYPE.EXTERNAL_NON_ADVERTISED.code ||
            selectionProcessTypeCode === SELECTION_PROCESS_TYPE.APPOINTMENT_INTERNAL_NON_ADVERTISED.code) && (
            <>
              <DescriptionListItem term={t('app:process-information.performed-duties')}>
                {hasPerformedSameDuties === true
                  ? t('app:process-information.yes')
                  : hasPerformedSameDuties === false
                    ? t('app:process-information.no')
                    : t('app:referral-requests.not-provided')}
              </DescriptionListItem>

              <DescriptionListItem term={t('app:process-information.non-advertised-appointment')}>
                {appointmentNonAdvertised ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>
            </>
          )}

          <DescriptionListItem term={t('app:process-information.employment-tenure')}>
            {employmentTenure ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          {employmentTenureCode === EMPLOYMENT_TENURE.term && (
            <>
              <DescriptionListItem term={t('app:process-information.projected-start-date')}>
                {projectedStartDate ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>

              <DescriptionListItem term={t('app:process-information.projected-end-date')}>
                {projectedEndDate ?? t('app:referral-requests.not-provided')}
              </DescriptionListItem>
            </>
          )}

          <DescriptionListItem term={t('app:process-information.work-schedule')}>
            {workSchedule ?? t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          <DescriptionListItem term={t('app:process-information.employment-equity-identified')}>
            {equityNeeded === true
              ? t('app:process-information.yes')
              : equityNeeded === false
                ? t('app:process-information.no')
                : t('app:referral-requests.not-provided')}
          </DescriptionListItem>

          {equityNeeded === true && (
            <DescriptionListItem term={t('app:process-information.preferred-employment-equities')}>
              {employmentEquities ?? t('app:referral-requests.not-provided')}
            </DescriptionListItem>
          )}
        </DescriptionList>
      )}
    </>
  );
}
