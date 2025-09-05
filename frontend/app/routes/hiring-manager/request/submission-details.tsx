import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/submission-details';

import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { extractUniqueBranchesFromDirectorates } from '~/.server/utils/directorate-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
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

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  requireAuthentication(context.session, request);

  //TODO: call request service to get default values

  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const directorates = await getDirectorateService().listAllLocalized(lang);
  // Extract unique branches from directorates that have parents
  const branchOrServiceCanadaRegions = extractUniqueBranchesFromDirectorates(directorates);
  const languagesOfCorrespondence = await getLanguageForCorrespondenceService().listAllLocalized(lang);

  return {
    documentTitle: t('app:submission-details.page-title'),
    defaultValues: {
      submitter: undefined,
      hiringManager: undefined,
      subDelegatedManager: undefined,
      hrAdvisor: undefined,
      workUnit: undefined,
      languageOfCorrespondence: undefined,
      additionalComment: undefined,
    },
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
        file="routes/hiring-manager/request/index.tsx"
        params={params}
        aria-label={t('app:hiring-manager-requests.back')}
      >
        {t('app:hiring-manager-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        <SubmissionDetailsForm
          cancelLink="routes/hiring-manager/request/index.tsx"
          formErrors={errors}
          formValues={loaderData.defaultValues}
          branchOrServiceCanadaRegions={loaderData.branchOrServiceCanadaRegions}
          directorates={loaderData.directorates}
          languagesOfCorrespondence={loaderData.languagesOfCorrespondence}
          params={params}
        />
      </div>
    </>
  );
}
