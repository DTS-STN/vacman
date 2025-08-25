import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
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
    log.debug(`User is not registered, redirecting to index`);
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  const user = userOption.unwrap();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = user.userType?.code;

  if (!userRole || !allowedRoles.includes(userRole)) {
    log.debug(`User role '${userRole}' is not in allowed roles [${allowedRoles.join(', ')}], redirecting to index`);
    throw i18nRedirect('routes/employee/index.tsx', currentUrl);
  }

  log.debug(`User is registered with role '${userRole}' (allowed: [${allowedRoles.join(', ')}]), allowing access`);
}

// Specific implementations
export async function checkHiringManagerRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  await requireRoleRegistration(session, request, 'hiring-manager', isHiringManagerPath);
}

export async function checkHrAdvisorRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  await requireRoleRegistration(session, request, ['admin', 'HRA'], isHrAdvisorPath);
}
