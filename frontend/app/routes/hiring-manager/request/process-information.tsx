import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/process-information';

import type { RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ProcessInformationForm } from '~/routes/page-components/requests/process-information/form';
import { processInformationSchema, toDateString } from '~/routes/page-components/requests/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  // TODO: consider extracting this out into a function similar to profile/employment-information
  const formData = await request.formData();
  const projectedStartDateYear = formData.get('projectedStartDateYear')?.toString();
  const projectedStartDateMonth = formData.get('projectedStartDateMonth')?.toString();
  const projectedStartDateDay = formData.get('projectedStartDateDay')?.toString();
  const projectedEndDateYear = formData.get('projectedEndDateYear')?.toString();
  const projectedEndDateMonth = formData.get('projectedEndDateMonth')?.toString();
  const projectedEndDateDay = formData.get('projectedEndDateDay')?.toString();
  const parseResult = v.safeParse(processInformationSchema, {
    selectionProcessNumber: formString(formData.get('selectionProcessNumber')),
    approvalReceived: formString(formData.get('approvalReceived'))
      ? formString(formData.get('approvalReceived')) === 'on'
      : undefined,
    priorityEntitlement: formString(formData.get('priorityEntitlement'))
      ? formString(formData.get('priorityEntitlement')) === REQUIRE_OPTIONS.yes
      : undefined,
    priorityEntitlementRationale: formString(formData.get('priorityEntitlementRationale')),
    selectionProcessType: formString(formData.get('selectionProcessType')),
    performedDuties: formString(formData.get('performedDuties'))
      ? formString(formData.get('performedDuties')) === REQUIRE_OPTIONS.yes
      : undefined,
    nonAdvertisedAppointment: formString(formData.get('nonAdvertisedAppointment')),
    employmentTenure: formString(formData.get('employmentTenure')),
    projectedStartDate: toDateString(projectedStartDateYear, projectedStartDateMonth, projectedStartDateDay),
    projectedStartDateYear,
    projectedStartDateMonth,
    projectedStartDateDay,
    projectedEndDate: toDateString(projectedEndDateYear, projectedEndDateMonth, projectedEndDateDay),
    projectedEndDateYear,
    projectedEndDateMonth,
    projectedEndDateDay,
    workSchedule: formString(formData.get('workSchedule')),
    employmentEquityIdentified: formString(formData.get('employmentEquityIdentified'))
      ? formString(formData.get('employmentEquityIdentified')) === REQUIRE_OPTIONS.yes
      : undefined,
    preferredEmploymentEquities: formData.getAll('preferredEmploymentEquities'),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof processInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const requestService = getRequestService();
  const requestResult = await requestService.getRequestById(Number(params.requestId), context.session.authState.accessToken);

  if (requestResult.isErr()) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestData: RequestReadModel = requestResult.unwrap();

  const requestPayload: RequestUpdateModel = {
    selectionProcessNumber: parseResult.output.selectionProcessNumber,
    workforceManagementApproved: parseResult.output.approvalReceived,
    priorityEntitlement: parseResult.output.priorityEntitlement,
    priorityEntitlementRationale: parseResult.output.priorityEntitlementRationale,
    selectionProcessTypeId: parseResult.output.selectionProcessType,
    performedSameDuties: parseResult.output.performedDuties,
    nonAdvertisedAppointmentId: parseResult.output.nonAdvertisedAppointment,
    employmentTenureId: parseResult.output.employmentTenure,
    projectedStartDate: parseResult.output.projectedStartDate,
    projectedEndDate: parseResult.output.projectedEndDate,
    workScheduleId: Number(parseResult.output.workSchedule),
    equityNeeded: parseResult.output.employmentEquityIdentified,
    employmentEquityIds: parseResult.output.preferredEmploymentEquities,
  };

  const updateResult = await requestService.updateRequestById(
    requestData.id,
    requestPayload,
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, {
    params: { requestId: requestData.id.toString() },
  });
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
      selectionProcessType: requestData.selectionProcessType,
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
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <BackLink
        className="mt-6"
        file="routes/hiring-manager/request/index.tsx"
        params={params}
        aria-label={t('app:hiring-manager-requests.back')}
      >
        {t('app:hiring-manager-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        <ProcessInformationForm
          selectionProcessTypes={loaderData.localizedSelectionProcessTypesResult}
          nonAdvertisedAppointments={loaderData.localizedNonAdvertisedAppointmentsResult}
          employmentTenures={loaderData.localizedEmploymentTenures}
          workSchedules={loaderData.localizedWorkSchedules}
          employmentEquities={loaderData.localizedEmploymentEquities}
          cancelLink={'routes/hiring-manager/request/index.tsx'}
          formErrors={actionData?.errors}
          formValues={loaderData.defaultValues}
          isReadOnly={false}
          params={params}
        />
      </div>
    </>
  );
}
