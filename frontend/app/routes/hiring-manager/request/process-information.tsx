import type { RouteHandle } from 'react-router';

import type { Route } from './+types/process-information';

import type { RequestReadModel } from '~/.server/domain/models';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { BackLink } from '~/components/back-link';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ProcessInformationForm } from '~/routes/page-components/requests/process-information/form';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  //TODO: add action and validation logic
}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  const requestResult = await getRequestService().getRequestById(
    Number(params.requestId),
    context.session.authState.accessToken,
  );

  if (requestResult.isErr()) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestData: RequestReadModel = requestResult.unwrap();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const localizedSelectionProcessTypesResult = await getSelectionProcessTypeService().listAllLocalized(lang);
  const localizedNonAdvertisedAppointmentsResult = await getNonAdvertisedAppointmentService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedWorkSchedules = await getWorkScheduleService().listAllLocalized(lang);
  const localizedEmploymentEquities = await getEmploymentEquityService().listAllLocalized(lang);

  return {
    documentTitle: t('app:process-information.page-title'),
    defaultValues: {
      selectionProcessNumber: requestData.selectionProcessNumber,
      approvalReceived: requestData.workforceMgmtApprovalRecvd,
      priorityEntitlement: requestData.priorityEntitlement,
      priorityEntitlementRationale: requestData.priorityEntitlementRationale,
      preferredSelectionProcessType: requestData.selectionProcessType,
      performedDuties: requestData.hasPerformedSameDuties,
      nonAdvertisedAppointment: requestData.appointmentNonAdvertised,
      employmentTenure: requestData.employmentTenure,
      projectedStartDate: requestData.projectedStartDate,
      projectedEndDate: requestData.projectedEndDate,
      workSchedule: requestData.workSchedule,
      employmentEquityIdentified: requestData.equityNeeded,
      preferredEmploymentEquities: requestData.employmentEquities,
    },
    localizedSelectionProcessTypesResult,
    localizedNonAdvertisedAppointmentsResult,
    localizedEmploymentTenures,
    localizedWorkSchedules,
    localizedEmploymentEquities,
  };
}

export default function HiringManagerRequestProcessInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const errors = undefined; //actionData?.errors;

  return (
    <>
      <BackLink className="mt-6" file="routes/hiring-manager/request/index.tsx" params={params} />
      <div className="max-w-prose">
        <ProcessInformationForm
          selectionProcessTypes={loaderData.localizedSelectionProcessTypesResult}
          nonAdvertisedAppointments={loaderData.localizedNonAdvertisedAppointmentsResult}
          employmentTenures={loaderData.localizedEmploymentTenures}
          workSchedules={loaderData.localizedWorkSchedules}
          employmentEquities={loaderData.localizedEmploymentEquities}
          cancelLink={'routes/hiring-manager/request/index.tsx'}
          formErrors={errors}
          formValues={loaderData.defaultValues}
          isReadOnly={false}
          params={params}
        />
      </div>
    </>
  );
}
