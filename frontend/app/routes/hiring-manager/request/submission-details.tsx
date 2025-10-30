import type { RouteHandle } from 'react-router';
import { data, useNavigation } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/submission-details';

import type { RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { mapRequestToUpdateModelWithOverrides } from '~/.server/utils/request-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUEST_STATUS_CODE, REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { SubmissionDetailsForm } from '~/routes/page-components/requests/submission-detail-form';
import type { Errors, SubmissionDetailSchema } from '~/routes/page-components/requests/validation.server';
import { createSubmissionDetailSchema } from '~/routes/page-components/requests/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  const formData = await request.formData();
  const parseResult = v.safeParse(await createSubmissionDetailSchema('hiring-manager'), {
    isSubmiterHiringManager: formData.get('isSubmiterHiringManager')
      ? formData.get('isSubmiterHiringManager') === REQUIRE_OPTIONS.yes
      : undefined,
    isSubmiterSubdelegate: formData.get('isSubmiterSubdelegate')
      ? formData.get('isSubmiterSubdelegate') === REQUIRE_OPTIONS.yes
      : undefined,
    isHiringManagerASubDelegate: formData.get('isHiringManagerASubDelegate')
      ? formData.get('isHiringManagerASubDelegate') === REQUIRE_OPTIONS.yes
      : undefined,
    hiringManagerEmailAddress: formString(formData.get('hiringManagerEmailAddress')),
    subDelegatedManagerEmailAddress: formString(formData.get('subDelegatedManagerEmailAddress')),
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    languageOfCorrespondenceId: formString(formData.get('languageOfCorrespondenceId')),
    additionalComment: formString(formData.get('additionalComment')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<SubmissionDetailSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const errors: Errors = {};
  let hiringManagerId: number | undefined;
  let subDelegatedManagerId: number | undefined;
  const userService = getUserService();
  if (parseResult.output.hiringManagerEmailAddress) {
    try {
      hiringManagerId = (
        await userService.getUsers({ email: parseResult.output.hiringManagerEmailAddress }, session.authState.accessToken)
      ).into()?.content[0]?.id;
    } catch {
      Object.assign(errors, { hiringManagerEmailAddress: [t('app:submission-details.errors.no-user-found-with-this-email')] });
    }
  }

  if (parseResult.output.subDelegatedManagerEmailAddress) {
    try {
      subDelegatedManagerId = (
        await userService.getUsers({ email: parseResult.output.subDelegatedManagerEmailAddress }, session.authState.accessToken)
      ).into()?.content[0]?.id;
    } catch {
      Object.assign(errors, {
        subDelegatedManagerEmailAddress: [t('app:submission-details.errors.no-user-found-with-this-email')],
      });
    }
  }

  // Check for errors again after checking subDelegatedManager
  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: HttpStatusCodes.BAD_REQUEST });
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

  const { isSubmiterHiringManager, isSubmiterSubdelegate, isHiringManagerASubDelegate } = parseResult.output;
  if (isSubmiterHiringManager) {
    hiringManagerId = requestData.submitter?.id;
    if (isSubmiterSubdelegate) {
      subDelegatedManagerId = requestData.submitter?.id;
    }
  } else if (isHiringManagerASubDelegate) {
    subDelegatedManagerId = hiringManagerId;
  }

  const requestPayload: RequestUpdateModel = mapRequestToUpdateModelWithOverrides(requestData, {
    // The submitter's information is coming from saved Request, but while creating a new request, the submitter is the logged in user,
    submitterId: requestData.submitter?.id ?? currentUser.id,
    hiringManagerId,
    subDelegatedManagerId,
    workUnitId: parseResult.output.directorate,
    languageOfCorrespondenceId: parseResult.output.languageOfCorrespondenceId,
    additionalComment: parseResult.output.additionalComment,
  });

  const updateResult = await requestService.updateRequestById(requestData.id, requestPayload, session.authState.accessToken);

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);
  const currentUserData = await getUserService().getCurrentUser(session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

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

  const directorates = await getWorkUnitService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const languagesOfCorrespondence = await getLanguageForCorrespondenceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:submission-details.page-title'),
    defaultValues: {
      // The submitter's information is coming from saved Request, but while creating a new request, the submitter is the logged in user,
      submitter: requestData.submitter ?? currentUser,
      hiringManager: requestData.hiringManager,
      subDelegatedManager: requestData.subDelegatedManager,
      hrAdvisor: requestData.hrAdvisor,
      workUnit: requestData.workUnit,
      languageOfCorrespondence: requestData.languageOfCorrespondence,
      additionalComment: requestData.additionalComment,
    },
    branchOrServiceCanadaRegions,
    directorates,
    languagesOfCorrespondence,
  };
}

export default function HiringManagerRequestSubmissionDetails({ loaderData, actionData, params }: Route.ComponentProps) {
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
        <SubmissionDetailsForm
          cancelLink="routes/hiring-manager/request/index.tsx"
          formErrors={actionData?.errors}
          formValues={loaderData.defaultValues}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
          view="hiring-manager"
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
