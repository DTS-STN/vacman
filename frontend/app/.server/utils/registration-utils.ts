import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { getRolesFromJWT } from '~/.server/utils/jwt-utils';
import { isHiringManagerPath, isHrAdvisorPath } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

export async function requireRoleRegistration(
  session: AuthenticatedSession,
  request: Request,
  roles: string | string[],
  routeChecker: (url: URL) => boolean,
): Promise<void> {
  const currentUrl = new URL(request.url);

  if (!routeChecker(currentUrl)) return;

  const userService = getUserService();
  const userOption = await userService.getCurrentUser(session.authState.accessToken);

  if (userOption.isNone()) {
    // Get roles from the access token to determine redirect destination
    const userRoles = getRolesFromJWT(session.authState.accessToken);

    if (userRoles.includes('hr-advisor')) {
      log.debug(`Unregistered user with hr-advisor role, redirecting to hr-advisor index`);
      throw i18nRedirect('routes/hr-advisor/index.tsx', currentUrl);
    } else {
      log.debug(`Unregistered user without hr-advisor role, redirecting to employee index`);
      throw i18nRedirect('routes/employee/index.tsx', currentUrl);
    }
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const userRoles = getRolesFromJWT(session.authState.accessToken);

  if (!userRoles.some((role) => allowedRoles.includes(role))) {
    log.debug(`User role '${userRoles}' is not in allowed roles [${allowedRoles.join(', ')}], redirecting to index`);
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  log.debug(`User is registered with role '${userRoles}' (allowed: [${allowedRoles.join(', ')}]), allowing access`);
}

// Specific implementations
export async function checkHiringManagerRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  await requireRoleRegistration(session, request, ['admin', 'hiring-manager'], isHiringManagerPath);
}

export async function checkHrAdvisorRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  await requireRoleRegistration(session, request, ['admin', 'hr-advisor'], isHrAdvisorPath);
}
