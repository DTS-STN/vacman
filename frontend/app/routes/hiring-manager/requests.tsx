import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import RequestsTables from '../page-components/requests/requests-tables';
import type { Route } from './+types/requests';

import type { RequestUpdateModel } from '~/.server/domain/models';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { PageTitle } from '~/components/page-title';
import { REQUEST_CATEGORY, REQUEST_STATUSES } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  const formData = await request.formData();
  switch (formData.get('action')) {
    case 'create': {
      const newRequestResult = await getRequestService().createRequest(session.authState.accessToken);
      const requestId = newRequestResult.into()?.id.toString();

      return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params: { requestId } });
    }
    case 'copy': {
      const copiedRequestId = formString(formData.get('requestId'));
      const copiedRequestData = (
        await getRequestService().getRequestById(Number(copiedRequestId), session.authState.accessToken)
      ).into();

      if (!copiedRequestData) {
        throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
      }
      const newRequestResult = await getRequestService().createRequest(session.authState.accessToken);
      const requestId = newRequestResult.into()?.id.toString();

      // Update new Request with data copied from other request

      const requestPayload: RequestUpdateModel = {
        positionNumbers: copiedRequestData.positionNumber,
        classificationId: copiedRequestData.classification?.id,
        englishTitle: copiedRequestData.englishTitle,
        frenchTitle: copiedRequestData.frenchTitle,
        cityIds: copiedRequestData.cities?.map((city) => ({ value: city.id })),
        languageRequirementId: copiedRequestData.languageRequirement?.id,
        englishLanguageProfile: copiedRequestData.englishLanguageProfile,
        frenchLanguageProfile: copiedRequestData.frenchLanguageProfile,
        securityClearanceId: copiedRequestData.securityClearance?.id,
        selectionProcessNumber: copiedRequestData.selectionProcessNumber,
        workforceMgmtApprovalRecvd: copiedRequestData.workforceMgmtApprovalRecvd,
        priorityEntitlement: copiedRequestData.priorityEntitlement,
        priorityEntitlementRationale: copiedRequestData.priorityEntitlementRationale,
        selectionProcessTypeId: copiedRequestData.selectionProcessType?.id,
        hasPerformedSameDuties: copiedRequestData.hasPerformedSameDuties,
        appointmentNonAdvertisedId: copiedRequestData.appointmentNonAdvertised?.id,
        employmentTenureId: copiedRequestData.employmentTenure?.id,
        projectedStartDate: copiedRequestData.projectedStartDate,
        projectedEndDate: copiedRequestData.projectedEndDate,
        workScheduleId: copiedRequestData.workSchedule?.id,
        equityNeeded: copiedRequestData.equityNeeded,
        employmentEquityIds: copiedRequestData.employmentEquities?.map((eq) => ({ value: eq.id })),
        englishStatementOfMerit: copiedRequestData.englishStatementOfMerit,
        frenchStatementOfMerit: copiedRequestData.frenchStatementOfMerit,
        submitterId: currentUser.id, // the sbmitter will be the one who copied
        workUnitId: copiedRequestData.workUnit?.id,
        languageOfCorrespondenceId: copiedRequestData.languageOfCorrespondence?.id,
        additionalComment: copiedRequestData.additionalComment,
      };

      const updateResult = await getRequestService().updateRequestById(
        Number(requestId),
        requestPayload,
        session.authState.accessToken,
      );

      if (updateResult.isErr()) {
        throw updateResult.unwrapErr();
      }

      return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params: { requestId } });
    }
  }

  return undefined;
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const currentUserResult = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserResult.unwrap();

  const searchParams = new URL(request.url).searchParams;

  // Active requests query
  const activeRequestsQuery = {
    page: Math.max(1, Number.parseInt(searchParams.get('activepage') ?? '1', 10) || 1),
    statusId: REQUEST_STATUSES.filter((s) => s.category === REQUEST_CATEGORY.active).map((s) => s.id.toString()),
    size: 10,
  };
  const activeRequestsResult = await getRequestService().getCurrentUserRequests(
    activeRequestsQuery,
    session.authState.accessToken,
  );
  if (activeRequestsResult.isErr()) {
    throw activeRequestsResult.unwrapErr();
  }

  // Inactive requests query
  const inactiveRequestsQuery = {
    page: Math.max(1, Number.parseInt(searchParams.get('inactivepage') ?? '1', 10) || 1),
    statusId: REQUEST_STATUSES.filter((s) => s.category === REQUEST_CATEGORY.inactive).map((s) => s.id.toString()),
    size: 10,
  };
  const inactiveRequestsResult = await getRequestService().getCurrentUserRequests(
    inactiveRequestsQuery,
    session.authState.accessToken,
  );
  if (inactiveRequestsResult.isErr()) {
    throw inactiveRequestsResult.unwrapErr();
  }

  const { content: activeRequests, page: activeRequestsPage } = activeRequestsResult.unwrap();
  const { content: inactiveRequests, page: inactiveRequestsPage } = inactiveRequestsResult.unwrap();

  return {
    documentTitle: t('app:hiring-manager-requests.page-title'),
    activeRequests,
    activeRequestsPage,
    inactiveRequests,
    inactiveRequestsPage,
    baseTimeZone: serverEnvironment.BASE_TIMEZONE,
    userId: currentUser.id,
    lang,
  };
}

export default function HiringManagerRequests({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="mb-8 space-y-4">
      <PageTitle className="after:w-14">{t('app:hiring-manager-requests.page-title')}</PageTitle>
      <BackLink
        aria-label={t('app:hiring-manager-requests.back-to-dashboard')}
        file="routes/hiring-manager/index.tsx"
        params={params}
      >
        {t('app:hiring-manager-requests.back-to-dashboard')}
      </BackLink>
      <RequestsTables {...loaderData} view="hiring-manager" />
    </div>
  );
}
