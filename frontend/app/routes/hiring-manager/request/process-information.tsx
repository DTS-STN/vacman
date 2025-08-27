import type { RouteHandle } from 'react-router';

import type { Route } from './+types/process-information';

import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { BackLink } from '~/components/back-link';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { ProcessInformationForm } from '~/routes/page-components/hiring-manager/process-information/form';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {}

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const localizedSelectionProcessTypesResult = await getSelectionProcessTypeService().listAllLocalized(lang);
  const localizedNonAdvertisedAppointmentsResult = await getNonAdvertisedAppointmentService().listAllLocalized(lang);
  const localizedEmploymentTenures = await getEmploymentTenureService().listAllLocalized(lang);
  const localizedWorkSchedules = await getWorkScheduleService().listAllLocalized(lang);
  const localizedEmploymentEquities = await getEmploymentTenureService().listAllLocalized(lang);

  return {
    documentTitle: t('app:process-information.page-title'),
    defaultValues: {
      selectionProcessNumber: undefined,
      approvalReceived: undefined,
      priorityEntitlement: undefined,
      priorityEntitlementRationale: undefined,
      preferredSelectionProcessType: undefined,
      performedDuties: undefined,
      nonAdvertisedAppointment: undefined,
      employmentTenure: undefined,
      projectedStartDate: undefined,
      projectedEndDate: undefined,
      workSchedule: undefined,
      employmentEquityIdentified: undefined,
      preferredEmploymentEquities: undefined,
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
