import type { RouteHandle } from 'react-router';

import type { Route } from './+types/index';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { hasUserProfile } from '~/.server/utils/profile-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

// TODO is registration happening anymore?  Can this action be moved elsewhere later?
export async function action({ context, request }: Route.ActionArgs) {
  const authenticatedSession = context.session as AuthenticatedSession;

  const formData = await request.formData();
  const dashboard = formData.get('dashboard');

  if (dashboard === 'employee') {
    // Check if user is registered in the system
    const activeDirectoryId = authenticatedSession.authState.idTokenClaims.oid as string;
    const existingProfile = await hasUserProfile(activeDirectoryId);

    if (existingProfile) {
      // User has existing profile
      return i18nRedirect('routes/employee/index.tsx', request);
    } else {
      // User has no profile, redirect to privacy consent
      return i18nRedirect('routes/employee/privacy-consent.tsx', request);
    }
  }

  if (dashboard === 'hiring-manager') {
    // Check if user is registered in the system
    const userService = getUserService();
    const activeDirectoryId = authenticatedSession.authState.idTokenClaims.oid as string;
    const existingUser = await userService.getUserByActiveDirectoryId(activeDirectoryId);

    if (existingUser) {
      // User exists in the system
      if (existingUser.role.includes('hiring-manager')) {
        // User is already a hiring-manager, redirect to hiring-manager dashboard
        return i18nRedirect('routes/hiring-manager/index.tsx', request);
      } else {
        // User exists but is not a hiring-manager, update their role to hiring-manager
        await userService.updateUserRole(activeDirectoryId, 'hiring-manager', authenticatedSession);
        return i18nRedirect('routes/hiring-manager/index.tsx', request);
      }
    } else {
      // User is not registered, register them as hiring-manager and redirect
      await userService.registerUser(
        {
          activeDirectoryId,
          role: 'hiring-manager',
          // No privacy consent required for hiring managers
        },
        authenticatedSession,
      );

      return i18nRedirect('routes/hiring-manager/index.tsx', request);
    }
  }

  // Invalid dashboard selection
  return new Response('Invalid dashboard selection', { status: 400 });
}

export function loader({ context, request }: Route.LoaderArgs) {
  return i18nRedirect('routes/employee/index.tsx', request);
}
