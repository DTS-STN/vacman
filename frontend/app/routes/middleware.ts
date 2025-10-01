import type { RouterContextProvider } from 'react-router';
import { redirect } from 'react-router';

import { LogFactory } from '~/.server/logging';

const log = LogFactory.getLogger(import.meta.url);

const CLOCK_SKEW_SECS = 10;

export function authMiddleware({ request, context }: { request: Request; context: Readonly<RouterContextProvider> }) {
  const { session } = context.get(context.applicationContext);
  const { pathname, search } = new URL(request.url);

  const returnToUrl = `/auth/login?returnto=${encodeURIComponent(pathname + search)}`;

  if (!session.authState) {
    log.debug('User is not authenticated; redirecting to login page');
    throw redirect(returnToUrl);
  }

  const { exp } = session.authState.accessTokenClaims;
  const currentTime = Math.floor(Date.now() / 1000);

  if (exp && currentTime - CLOCK_SKEW_SECS >= exp) {
    log.debug('JWT access token has expired (with clock skew); redirecting to login page');
    throw redirect(returnToUrl);
  }
}
