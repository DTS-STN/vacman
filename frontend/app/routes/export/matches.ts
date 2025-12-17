import type { Route } from './+types/matches';

import { getRequestService } from '~/.server/domain/services/request-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { exportSpreadsheet } from '~/.server/utils/export-utils';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import { getTranslation } from '~/i18n-config.server';

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { session } = context.get(context.applicationContext);
  requireAuthentication(session, request);

  const { t } = await getTranslation(request, ['app', 'gcweb']);

  const requestData = (
    await getRequestService().getRequestById(Number(params.requestId), session.authState.accessToken)
  ).into();

  if (!requestData) {
    throw new Response('Request not found', { status: HttpStatusCodes.NOT_FOUND });
  }

  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.getAll('sort');
  const requestMatchesResult = await getRequestService().getRequestMatchesDownload(
    parseInt(params.requestId),
    {
      sort: sortParam.length > 0 ? sortParam : undefined,
      profile: {
        employeeName: searchParams.get('employeeName') ?? undefined,
        wfaStatusId: searchParams.getAll('wfaStatusId').map((id) => parseInt(id)),
      },
      matchFeedbackId: searchParams.getAll('matchFeedbackId').map((id) => parseInt(id)),
    },
    session.authState.accessToken,
  );
  if (requestMatchesResult.isErr()) {
    throw requestMatchesResult.unwrapErr();
  }

  return exportSpreadsheet(requestMatchesResult.unwrap(), `${t('matches.page-title')} ${params.requestId}`);
}
