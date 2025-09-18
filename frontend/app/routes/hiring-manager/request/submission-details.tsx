import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/submission-details';

import type { RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { SubmissionDetailsForm } from '~/routes/page-components/requests/submission-detail/form';
import { createSubmissionDetailSchema } from '~/routes/page-components/requests/validation.server';
import type { SubmissionDetailSchema } from '~/routes/page-components/requests/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);
  const currentUserData = await getUserService().getCurrentUser(context.session.authState.accessToken);
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

  // call user service to get the user id from the email address

  let hiringManagerId;
  if (parseResult.output.hiringManagerEmailAddress) {
    const hiringManagerResult = await getUserService().getUsers(
      { email: parseResult.output.hiringManagerEmailAddress },
      context.session.authState.accessToken,
    );
    const hiringManager = hiringManagerResult.into()?.content[0]; // TODO: add the error handling if content[0] is undefined
    hiringManagerId = hiringManager?.id;
  }

  let subDelegatedManagerId;
  if (parseResult.output.subDelegatedManagerEmailAddress) {
    const subDelegatedManagerResult = await getUserService().getUsers(
      { email: parseResult.output.subDelegatedManagerEmailAddress },
      context.session.authState.accessToken,
    );

    const subDelegatedManager = subDelegatedManagerResult.into()?.content[0]; // TODO: add the error handling if content[0] is undefined
    subDelegatedManagerId = subDelegatedManager?.id;
  }

  if (parseResult.output.isSubmiterHiringManager === true) {
    hiringManagerId = currentUser.id;
  }

  if (parseResult.output.isSubmiterHiringManager === true && parseResult.output.isSubmiterSubdelegate === true) {
    subDelegatedManagerId = currentUser.id;
  }

  if (parseResult.output.isSubmiterHiringManager === false && parseResult.output.isHiringManagerASubDelegate === true) {
    subDelegatedManagerId = hiringManagerId;
  }

  // call request service to update data

  const requestService = getRequestService();
  const requestResult = await requestService.getRequestById(Number(params.requestId), context.session.authState.accessToken);

  if (requestResult.isErr()) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const requestData: RequestReadModel = requestResult.unwrap();

  const requestPayload: RequestUpdateModel = {
    // The submitter's information is coming from saved Request, but while creating a new request, the submitter is the logged in user,
    submitterId: requestData.submitter?.id ?? currentUser.id,
    hiringManagerId: hiringManagerId,
    subDelegatedManagerId: subDelegatedManagerId,
    workUnitId: parseResult.output.directorate,
    languageOfCorrespondenceId: parseResult.output.languageOfCorrespondenceId,
    additionalComment: parseResult.output.additionalComment,
  };

  const updateResult = await requestService.updateRequestById(
    requestData.id,
    requestPayload,
    context.session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);
  const currentUserData = await getUserService().getCurrentUser(context.session.authState.accessToken);
  const currentUser = currentUserData.unwrap();

  const requestResult = await getRequestService().getRequestById(
    Number(params.requestId),
    context.session.authState.accessToken,
  );
  const requestData = requestResult.into();

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const directorates = await getDirectorateService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const languagesOfCorrespondence = await getLanguageForCorrespondenceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:submission-details.page-title'),
    defaultValues: {
      // The submitter's information is coming from saved Request, but while creating a new request, the submitter is the logged in user,
      submitter: requestData?.submitter ?? currentUser,
      hiringManager: requestData?.hiringManager,
      subDelegatedManager: requestData?.subDelegatedManager,
      hrAdvisor: requestData?.hrAdvisor,
      workUnit: requestData?.workUnit,
      languageOfCorrespondence: requestData?.languageOfCorrespondence,
      additionalComment: requestData?.additionalComment,
    },
    branchOrServiceCanadaRegions,
    directorates,
    languagesOfCorrespondence,
  };
}

export default function HiringManagerRequestSubmissionDetails({ loaderData, actionData, params }: Route.ComponentProps) {
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
        <SubmissionDetailsForm
          cancelLink="routes/hiring-manager/request/index.tsx"
          formErrors={actionData?.errors}
          formValues={loaderData.defaultValues}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
          view="hiring-manager"
        />
      </div>
    </>
  );
}
