import type { Route } from './+types/index';

import { requireAuthentication } from '~/.server/utils/auth-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

export function loader({ context, request }: Route.LoaderArgs) {
  // First ensure the user is authenticated
  requireAuthentication(context.session, request);

  // Get user roles from the access token claims
  const userRoles = context.session.authState.accessTokenClaims.roles;

  // Redirect based on roles
  if (userRoles?.includes('hr-advisor')) {
    return i18nRedirect('routes/hr-advisor/index.tsx', request);
  } else {
    return i18nRedirect('routes/employee/index.tsx', request);
  }
}
