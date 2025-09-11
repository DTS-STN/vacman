import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/submission-details';

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

  const formData = await request.formData();

  const action = formData.get('action');

  if (action === 'searchHiringManagerEmailAddress') {
    const parseResult = v.safeParse(
      v.object({
        hiringManagerEmailAddress: v.pipe(
          v.string('app:submission-details.errors.hiring-manager-email-required'),
          v.trim(),
          v.nonEmpty('app:submission-details.errors.hiring-manager-email-required'),
          v.email('app:submission-details.errors.hiring-manager-email-invalid'),
        ),
      }),
      {
        hiringManagerEmailAddress: formString(formData.get('hiringManagerEmailAddress')),
      },
    );

    if (!parseResult.success) {
      return {
        errors: v.flatten(parseResult.issues).nested,
      };
    }

    const userResult = await getUserService().getUserByEmail(
      parseResult.output.hiringManagerEmailAddress,
      context.session.authState.accessToken,
    );
    const hiringManager = userResult.into();
    const hiringManagerName = `${hiringManager?.firstName ?? ''} ${hiringManager?.lastName ?? ''}`.trim();
    return { hiringManagerName };
  }

  if (action === 'searchSubDelegatedManagerEmailAddress') {
    const parseResult = v.safeParse(
      v.object({
        subDelegatedManagerEmailAddress: v.pipe(
          v.string('app:submission-details.errors.sub-delegate-email-required'),
          v.trim(),
          v.nonEmpty('app:submission-details.errors.sub-delegate-email-required'),
          v.email('app:submission-details.errors.sub-delegate-email-invalid'),
        ),
      }),
      {
        subDelegatedManagerEmailAddress: formString(formData.get('subDelegatedManagerEmailAddress')),
      },
    );

    if (!parseResult.success) {
      return {
        errors: v.flatten(parseResult.issues).nested,
      };
    }

    const userResult = await getUserService().getUserByEmail(
      parseResult.output.subDelegatedManagerEmailAddress,
      context.session.authState.accessToken,
    );

    const subDelegatedManager = userResult.into();
    const subDelegatedManagerName = `${subDelegatedManager?.firstName ?? ''} ${subDelegatedManager?.lastName ?? ''}`.trim();
    return { subDelegatedManagerName };
  }

  if (action === 'submit') {
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

    //TODO: call request service to update data

    return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
  }
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
