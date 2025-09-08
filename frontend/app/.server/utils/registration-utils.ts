import { getUserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import { requireAnyRole } from '~/.server/utils/auth-utils';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { isHiringManagerPath, isHrAdvisorPath } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Requires role-based registration for authenticated users accessing specific routes.
 *
 * This function checks if a user is registered and has the appropriate roles to access
 * a route. If the user is not registered, they are redirected to the appropriate
 * registration page based on their role. If registered but lacking required roles,
 * role validation is performed.
 *
 * @param session - The authenticated session containing user authentication state
 * @param request - The incoming HTTP request object
 * @param roles - A single role string or array of role strings required for access
 * @param routeChecker - A function that determines if the current URL requires role checking
 *
 * @throws {Response} Redirects unregistered users to appropriate registration routes:
 *   - HR advisors are redirected to 'routes/hr-advisor/index.tsx'
 *   - Other users are redirected to 'routes/employee/index.tsx'
 *
 * @throws {AppError} Throws an AppError if the registered user does not have the necessary roles
 *
 * @returns Promise that resolves when validation passes or throws on redirect/validation failure
 */
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
    const userRoles = session.authState.accessTokenClaims.roles;

    if (userRoles?.includes('hr-advisor')) {
      log.debug(`Unregistered user with hr-advisor role, redirecting to hr-advisor index`);
      throw i18nRedirect('routes/hr-advisor/index.tsx', currentUrl);
    } else {
      log.debug(`Unregistered user without hr-advisor role, redirecting to employee index`);
      throw i18nRedirect('routes/employee/index.tsx', currentUrl);
    }
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  requireAnyRole(session, currentUrl, rolesArray as Role[]);

  const userRoles = session.authState.accessTokenClaims.roles;
  log.debug(`User is registered with role '${userRoles}' (allowed: [${rolesArray.join(', ')}]), allowing access`);
}

// Specific implementations
export async function checkHiringManagerRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  // TODO: Apply a fix to route to hiring manager dashboard on login
  // There is no security group in Azure AD for hiring managers, hiring managers are also regular users
  // To route to the hiring manager dashboard on login, we could check if the user has submitted any hiring requests
  // Also need to consider that the employee shouldn't be able to navigate to the hiring managers route by typing in the url,
  // that's why the roles are kept for now even if they are not present in the Azure AD.
  await requireRoleRegistration(session, request, ['admin', 'hr-advisor', 'hiring-manager'], isHiringManagerPath);
}

/**
 * Checks if the authenticated user has proper HR advisor route registration and permissions.
 *
 * This function validates HR advisor route access by:
 * 1. Checking if the current URL is an HR advisor path
 * 2. Verifying the user is registered in the system
 * 3. Ensuring the user has either 'admin' or 'hr-advisor' roles
 *
 * For unregistered users, redirects are performed based on their JWT roles:
 * - Users with 'hr-advisor' role are redirected to HR advisor registration
 * - Other users are redirected to employee registration
 *
 * @param session - The authenticated session containing user authentication state
 * @param request - The incoming HTTP request object
 *
 * @throws {Response} Redirects unregistered users to appropriate registration routes
 * @throws {AppError} Throws an AppError if the registered user lacks 'admin' or 'hr-advisor' roles
 *
 * @returns A promise that resolves if validation passes, or throws on redirect/validation failure
 */
export async function checkHrAdvisorRouteRegistration(session: AuthenticatedSession, request: Request): Promise<void> {
  await requireRoleRegistration(session, request, ['admin', 'hr-advisor'], isHrAdvisorPath);
}
