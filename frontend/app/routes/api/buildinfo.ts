import type { Route } from './+types/buildinfo';

import { serverEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';

const log = LogFactory.getLogger(import.meta.url);

/**
 * An endpoint that provides build information about the application.
 */
export function loader({ context, params, request }: Route.LoaderArgs) {
  const { BUILD_DATE, BUILD_ID, BUILD_REVISION, BUILD_VERSION } = serverEnvironment;
  log.info('Build info requested', { url: request.url, method: request.method });

  return Response.json({
    buildDate: BUILD_DATE,
    buildId: BUILD_ID,
    buildRevision: BUILD_REVISION,
    buildVersion: BUILD_VERSION,
  });
}
