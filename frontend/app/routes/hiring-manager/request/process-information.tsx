import type { RouteHandle } from 'react-router';
import { data, useNavigation } from 'react-router';

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
import { mapRequestToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUEST_STATUS_CODE } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ProcessInformationForm } from '~/routes/page-components/requests/process-information-form';
import type { ProcessInformationSchema } from '~/routes/page-components/requests/validation.server';
import { parseProcessInformation } from '~/routes/page-components/requests/validation.server';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const formData = await request.formData();
  const { parseResult } = await parseProcessInformation(formData);

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<ProcessInformationSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const requestService = getRequestService();
  const requestResult = await requestService.getRequestById(Number(params.requestId), session.authState.accessToken);

  if (requestResult.isErr()) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestData: RequestReadModel = requestResult.unwrap();
  if (!requestData.status || requestData.status.code !== REQUEST_STATUS_CODE.DRAFT) {
    throw new Response('Cannot edit request', { status: HttpStatusCodes.BAD_REQUEST });
  }

  const requestPayload: RequestUpdateModel = mapRequestToUpdateModelWithOverrides(requestData, {
    selectionProcessNumber: parseResult.output.selectionProcessNumber,
    workforceMgmtApprovalRecvd: parseResult.output.approvalReceived,
    priorityEntitlement: parseResult.output.priorityEntitlement,
    priorityEntitlementRationale: parseResult.output.priorityEntitlementRationale,
    selectionProcessTypeId: parseResult.output.selectionProcessType,
    hasPerformedSameDuties: parseResult.output.performedDuties,
    appointmentNonAdvertisedId: parseResult.output.nonAdvertisedAppointment,
    employmentTenureId: parseResult.output.employmentTenure,
    projectedStartDate: parseResult.output.projectedStartDate,
    projectedEndDate: parseResult.output.projectedEndDate,
    workScheduleId: Number(parseResult.output.workSchedule),
    equityNeeded: parseResult.output.employmentEquityIdentified,
    employmentEquityIds: parseResult.output.preferredEmploymentEquities?.map((id) => ({ value: id })),
  });

  const updateResult = await requestService.updateRequestById(requestData.id, requestPayload, session.authState.accessToken);

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
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

  if (!requestData.status || requestData.status.code !== REQUEST_STATUS_CODE.DRAFT) {
    throw new Response('Cannot edit request', { status: HttpStatusCodes.NOT_FOUND });
  }

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const localizedSelectionProcessTypesResult = await getSelectionProcessTypeService().listAllLocalized(lang);
  const localizedNonAdvertisedAppointmentsResult = await getNonAdvertisedAppointmentService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedWorkSchedules = await getWorkScheduleService().listAllLocalized(lang);
  const localizedEmploymentEquities = await getEmploymentEquityService().listAllLocalized(lang);

  const sortedSelectionProcessTypes = [...localizedSelectionProcessTypesResult].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

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
    localizedSelectionProcessTypesResult: sortedSelectionProcessTypes,
    localizedNonAdvertisedAppointmentsResult,
    localizedEmploymentTenures,
    localizedWorkSchedules,
    localizedEmploymentEquities,
  };
}

export default function HiringManagerRequestProcessInformation({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

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
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
