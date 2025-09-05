import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/submission-details';

import type { RequestReadModel } from '~/.server/domain/models';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getRequestService } from '~/.server/domain/services/request-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUIRE_OPTIONS } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { SubmissionDetailsForm } from '~/routes/page-components/requests/submission-detail/form';
import { submissionDetailSchema } from '~/routes/page-components/requests/validation.server';
import { formString } from '~/utils/string-utils';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData.documentTitle }];
}

export async function action({ context, params, request }: Route.ActionArgs) {
  requireAuthentication(context.session, request);

  const formData = await request.formData();
  const parseResult = v.safeParse(submissionDetailSchema, {
    isSubmiterHiringManager: formData.get('isSubmiterHiringManager')
      ? formData.get('isSubmiterHiringManager') === REQUIRE_OPTIONS.yes
      : undefined,
    branchOrServiceCanadaRegion: formString(formData.get('branchOrServiceCanadaRegion')),
    directorate: formString(formData.get('directorate')),
    languageOfCorrespondenceId: formString(formData.get('languageOfCorrespondenceId')),
    additionalComment: formString(formData.get('additionalComment')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof submissionDetailSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  //TODO: call request service to update data

  return i18nRedirect('routes/hr-advisor/request/index.tsx', request, { params });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
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

  const directorates = await getDirectorateService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const languagesOfCorrespondence = await getLanguageForCorrespondenceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:submission-details.page-title'),
    defaultValues: {
      submitter: requestData.submitter, // The Hr-advisor can't create a Request. The submitter information is coming from the saved Request.
      hiringManager: requestData.hiringManager,
      subDelegatedManager: requestData.subDelegatedManager,
      hrAdvisor: requestData.hrAdvisor,
      workUnit: requestData.workUnit,
      languageOfCorrespondence: requestData.languageOfCorrespondence,
      additionalComment: requestData.additionalComment,
    },
    isSubmitterHiringManage: requestData.submitter?.id === requestData.hiringManager?.id,
    branchOrServiceCanadaRegions,
    directorates,
    languagesOfCorrespondence,
  };
}

export default function HiringManagerRequestSubmissionDetails({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errors = actionData?.errors;

  return (
    <>
      <BackLink
        className="mt-6"
        file="routes/hr-advisor/request/index.tsx"
        params={params}
        aria-label={t('app:hr-advisor-requests.back')}
      >
        {t('app:hr-advisor-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        <SubmissionDetailsForm
          cancelLink="routes/hr-advisor/request/index.tsx"
          formErrors={errors}
          formValues={loaderData.defaultValues}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
          view="hr-advisor"
        />
      </div>
    </>
  );
}
