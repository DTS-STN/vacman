import type { RouteHandle } from 'react-router';
import { data } from 'react-router';

import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/somc-conditions';

import { getRequestService } from '~/.server/domain/services/request-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { BackLink } from '~/components/back-link';
import { REQUEST_STATUS_CODE } from '~/domain/constants';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import { SomcConditionsForm } from '~/routes/page-components/requests/somc-conditions/form';
import { somcConditionsSchema } from '~/routes/page-components/requests/validation.server';
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

  const editable =
    (await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)).into()?.status?.code ===
    REQUEST_STATUS_CODE.DRAFT;
  if (!editable) {
    throw new Response('Cannot edit request', { status: HttpStatusCodes.BAD_REQUEST });
  }

  const formData = await request.formData();
  const parseResult = v.safeParse(somcConditionsSchema, {
    englishStatementOfMerit: formString(formData.get('englishStatementOfMerit')),
    frenchStatementOfMerit: formString(formData.get('frenchStatementOfMerit')),
  });

  if (!parseResult.success) {
    return data(
      { errors: v.flatten<typeof somcConditionsSchema>(parseResult.issues).nested },
      { status: HttpStatusCodes.BAD_REQUEST },
    );
  }

  const updateResult = await getRequestService().updateRequestById(
    Number(params.requestId),
    parseResult.output,
    session.authState.accessToken,
  );

  if (updateResult.isErr()) {
    throw updateResult.unwrapErr();
  }

  return i18nRedirect('routes/hiring-manager/request/index.tsx', request, { params });
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t } = await getTranslation(request, handle.i18nNamespace);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  return {
    documentTitle: t('app:somc-conditions.page-title'),
    defaultValues: {
      englishStatementOfMerit: requestData.englishStatementOfMerit,
      frenchStatementOfMerit: requestData.frenchStatementOfMerit,
    },
    canEdit: requestData.status?.code === REQUEST_STATUS_CODE.DRAFT,
  };
}

export default function HiringManagerRequestSomcConditions({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <BackLink
        aria-label={t('app:hiring-manager-requests.back')}
        className="mt-6"
        file="routes/hiring-manager/request/index.tsx"
        params={params}
      >
        {t('app:hiring-manager-requests.back')}
      </BackLink>
      <div className="max-w-prose">
        <SomcConditionsForm
          canEdit={loaderData.canEdit}
          cancelLink="routes/hiring-manager/request/index.tsx"
          formErrors={actionData?.errors}
          formValues={loaderData.defaultValues}
          params={params}
        />
      </div>
    </>
  );
}
