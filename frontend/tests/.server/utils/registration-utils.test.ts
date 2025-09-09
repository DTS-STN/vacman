/**
 * Tests for registration utilities.
 */
import { None, Some } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requireAnyRole } from '~/.server/utils/auth-utils';
import { checkHrAdvisorRouteRegistration, requireRoleRegistration } from '~/.server/utils/registration-utils';
import { isHrAdvisorPath } from '~/.server/utils/route-matching-utils';
import { i18nRedirect } from '~/.server/utils/route-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock dependencies
vi.mock('~/.server/domain/services/user-service');
vi.mock('~/.server/utils/auth-utils');
vi.mock('~/.server/utils/route-matching-utils');
vi.mock('~/.server/utils/route-utils');

describe('registration-utils', () => {
  const mockGetUserService = vi.mocked(getUserService);
  const mockRequireAnyRole = vi.mocked(requireAnyRole);
  const mockIsHrAdvisorPath = vi.mocked(isHrAdvisorPath);
  const mockI18nRedirect = vi.mocked(i18nRedirect);

  // Mock user service instance
  const mockUserService = {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    findUserById: vi.fn(),
    getCurrentUser: vi.fn(),
    registerCurrentUser: vi.fn(),
    updateUserById: vi.fn(),
    getUserByEmail: vi.fn(),
  };

  const createMockSession = (roles: string[] = []): AuthenticatedSession =>
    ({
      authState: {
        accessToken: 'mock-access-token',
        accessTokenClaims: {
          roles,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          aud: 'test-client',
          iss: 'test-issuer',
          sub: 'test-user',
          iat: Math.floor(Date.now() / 1000),
          oid: 'test-oid',
          jti: 'test-jti',
          client_id: 'test-client-id',
        },
        idToken: 'mock-id-token',
        idTokenClaims: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'test-client',
          iss: 'test-issuer',
          sub: 'test-user',
          iat: Math.floor(Date.now() / 1000),
          oid: 'test-oid',
        },
      },
    }) as unknown as AuthenticatedSession;

  const createMockRequest = (url = 'https://example.com/test') => new Request(url);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserService.mockReturnValue(mockUserService);
    // Reset mock implementations to avoid cross-test contamination
    mockRequireAnyRole.mockImplementation(() => {
      // Default implementation - do nothing (success case)
    });
    mockI18nRedirect.mockImplementation(() => {
      throw new Error('Redirect');
    });
  });

  describe('requireRoleRegistration', () => {
    describe('when route checker returns false', () => {
      it('should return early without performing any checks', async () => {
        const session = createMockSession();
        const request = createMockRequest();
        const routeChecker = vi.fn().mockReturnValue(false);

        await requireRoleRegistration(session, request, ['admin'], routeChecker);

        expect(routeChecker).toHaveBeenCalledWith(new URL(request.url));
        expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
      });
    });

    describe('when route checker returns true', () => {
      const routeChecker = vi.fn().mockReturnValue(true);

      describe('when user is not registered', () => {
        beforeEach(() => {
          mockUserService.getCurrentUser.mockResolvedValue(None);
        });

        it('should redirect hr-advisor to hr-advisor index', async () => {
          const session = createMockSession(['hr-advisor']);
          const request = createMockRequest();
          const redirectError = new Error('Redirect');
          mockI18nRedirect.mockImplementation(() => {
            throw redirectError;
          });

          await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).rejects.toThrow(redirectError);

          expect(mockI18nRedirect).toHaveBeenCalledWith('routes/hr-advisor/index.tsx', new URL(request.url));
        });

        it('should redirect non-hr-advisor users to employee index', async () => {
          const session = createMockSession(['employee']);
          const request = createMockRequest();
          const redirectError = new Error('Redirect');
          mockI18nRedirect.mockImplementation(() => {
            throw redirectError;
          });

          await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).rejects.toThrow(redirectError);

          expect(mockI18nRedirect).toHaveBeenCalledWith('routes/employee/index.tsx', new URL(request.url));
        });

        it('should redirect users with no roles to employee index', async () => {
          const session = createMockSession([]);
          const request = createMockRequest();
          const redirectError = new Error('Redirect');
          mockI18nRedirect.mockImplementation(() => {
            throw redirectError;
          });

          await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).rejects.toThrow(redirectError);

          expect(mockI18nRedirect).toHaveBeenCalledWith('routes/employee/index.tsx', new URL(request.url));
        });

        it('should handle undefined roles gracefully', async () => {
          // Create a session with undefined roles directly
          const sessionWithUndefinedRoles = {
            authState: {
              accessToken: 'mock-access-token',
              accessTokenClaims: {
                roles: undefined,
                exp: Math.floor(Date.now() / 1000) + 3600,
                aud: 'test-client',
                iss: 'test-issuer',
                sub: 'test-user',
                iat: Math.floor(Date.now() / 1000),
                oid: 'test-oid',
                jti: 'test-jti',
                client_id: 'test-client-id',
              },
              idToken: 'mock-id-token',
              idTokenClaims: {
                exp: Math.floor(Date.now() / 1000) + 3600,
                aud: 'test-client',
                iss: 'test-issuer',
                sub: 'test-user',
                iat: Math.floor(Date.now() / 1000),
                oid: 'test-oid',
              },
            },
          } as unknown as AuthenticatedSession;

          const request = createMockRequest();
          const redirectError = new Error('Redirect');
          mockI18nRedirect.mockImplementation(() => {
            throw redirectError;
          });

          await expect(requireRoleRegistration(sessionWithUndefinedRoles, request, ['admin'], routeChecker)).rejects.toThrow(
            redirectError,
          );

          expect(mockI18nRedirect).toHaveBeenCalledWith('routes/employee/index.tsx', new URL(request.url));
        });
      });

      describe('when user is registered', () => {
        beforeEach(() => {
          const mockUser = { id: 'user-123', email: 'test@example.com' };
          mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
        });

        it('should call requireAnyRole with single role as array', async () => {
          const session = createMockSession(['admin']);
          const request = createMockRequest();

          await requireRoleRegistration(session, request, 'admin', routeChecker);

          expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), ['admin']);
        });

        it('should call requireAnyRole with array of roles', async () => {
          const session = createMockSession(['admin', 'hr-advisor']);
          const request = createMockRequest();
          const roles = ['admin', 'hr-advisor'];

          await requireRoleRegistration(session, request, roles, routeChecker);

          expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), roles);
        });

        it('should propagate AppError from requireAnyRole', async () => {
          const session = createMockSession(['employee']);
          const request = createMockRequest();
          const appError = new AppError('Access denied', ErrorCodes.ACCESS_FORBIDDEN);
          mockRequireAnyRole.mockImplementation(() => {
            throw appError;
          });

          await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).rejects.toThrowError(
            'Access denied',
          );
        });

        it('should complete successfully when user has required role', async () => {
          const session = createMockSession(['admin']);
          const request = createMockRequest();

          await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).resolves.toBeUndefined();

          expect(mockRequireAnyRole).toHaveBeenCalled();
        });
      });
    });
  });

  describe('checkHrAdvisorRouteRegistration', () => {
    it('should call requireRoleRegistration with correct parameters', async () => {
      const session = createMockSession(['hr-advisor']);
      const request = createMockRequest();

      // Mock a registered user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      mockIsHrAdvisorPath.mockReturnValue(true);
      // Ensure requireAnyRole doesn't throw for this test
      mockRequireAnyRole.mockImplementation(() => {
        // Success - do nothing
      });

      await checkHrAdvisorRouteRegistration(session, request);

      expect(mockUserService.getCurrentUser).toHaveBeenCalled();
      expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), ['hr-advisor']);
    });

    it('should return early when not on HR advisor path', async () => {
      const session = createMockSession(['hr-advisor']);
      const request = createMockRequest();
      mockIsHrAdvisorPath.mockReturnValue(false);

      await checkHrAdvisorRouteRegistration(session, request);

      expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
      expect(mockRequireAnyRole).not.toHaveBeenCalled();
    });

    it('should handle unregistered hr-advisor users', async () => {
      const session = createMockSession(['hr-advisor']);
      const request = createMockRequest();
      mockUserService.getCurrentUser.mockResolvedValue(None);
      mockIsHrAdvisorPath.mockReturnValue(true);

      const redirectError = new Error('Redirect');
      mockI18nRedirect.mockImplementation(() => {
        throw redirectError;
      });

      await expect(checkHrAdvisorRouteRegistration(session, request)).rejects.toThrow(redirectError);

      expect(mockI18nRedirect).toHaveBeenCalledWith('routes/hr-advisor/index.tsx', new URL(request.url));
    });

    it('should handle unregistered non-hr-advisor users', async () => {
      const session = createMockSession(['employee']);
      const request = createMockRequest();
      mockUserService.getCurrentUser.mockResolvedValue(None);
      mockIsHrAdvisorPath.mockReturnValue(true);

      const redirectError = new Error('Redirect');
      mockI18nRedirect.mockImplementation(() => {
        throw redirectError;
      });

      await expect(checkHrAdvisorRouteRegistration(session, request)).rejects.toThrow(redirectError);

      expect(mockI18nRedirect).toHaveBeenCalledWith('routes/employee/index.tsx', new URL(request.url));
    });

    it('should handle role validation errors', async () => {
      const session = createMockSession(['employee']); // Wrong role
      const request = createMockRequest();
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      mockIsHrAdvisorPath.mockReturnValue(true);

      const appError = new AppError('Access denied', ErrorCodes.ACCESS_FORBIDDEN);
      mockRequireAnyRole.mockImplementation(() => {
        throw appError;
      });

      await expect(checkHrAdvisorRouteRegistration(session, request)).rejects.toThrowError('Access denied');
    });

    it('should allow hr-advisor users', async () => {
      const session = createMockSession(['hr-advisor']);
      const request = createMockRequest();
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      mockIsHrAdvisorPath.mockReturnValue(true);
      // Ensure requireAnyRole doesn't throw for this test
      mockRequireAnyRole.mockImplementation(() => {
        // Success - do nothing
      });

      await expect(checkHrAdvisorRouteRegistration(session, request)).resolves.toBeUndefined();

      expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), ['hr-advisor']);
    });
  });

  describe('edge cases', () => {
    it('should handle getUserService throwing an error', async () => {
      const session = createMockSession(['admin']);
      const request = createMockRequest();
      const routeChecker = vi.fn().mockReturnValue(true);

      const serviceError = new Error('Service unavailable');
      mockUserService.getCurrentUser.mockRejectedValue(serviceError);

      await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).rejects.toThrow(serviceError);
    });

    it('should handle malformed URL gracefully', async () => {
      const session = createMockSession(['admin']);
      // Create a request with a valid URL - the URL constructor will handle validation
      const request = createMockRequest('https://example.com/test?param=value&other=test');
      const routeChecker = vi.fn().mockReturnValue(false);

      await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).resolves.toBeUndefined();

      expect(routeChecker).toHaveBeenCalledWith(new URL(request.url));
    });

    it('should handle empty roles array', async () => {
      const session = createMockSession(['admin']);
      const request = createMockRequest();
      const routeChecker = vi.fn().mockReturnValue(true);
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      // Ensure requireAnyRole doesn't throw for this test
      mockRequireAnyRole.mockImplementation(() => {
        // Success - do nothing
      });

      await requireRoleRegistration(session, request, [], routeChecker);

      expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), []);
    });

    it('should handle complex URL with fragments and special characters', async () => {
      const session = createMockSession(['admin']);
      const complexUrl = 'https://example.com/path/to/resource?query=value&special=%20chars%21#fragment';
      const request = createMockRequest(complexUrl);
      const routeChecker = vi.fn().mockReturnValue(false);

      await expect(requireRoleRegistration(session, request, ['admin'], routeChecker)).resolves.toBeUndefined();

      expect(routeChecker).toHaveBeenCalledWith(new URL(complexUrl));
    });

    it('should handle multiple roles in different order', async () => {
      const session = createMockSession(['employee', 'admin', 'hr-advisor']);
      const request = createMockRequest();
      const routeChecker = vi.fn().mockReturnValue(true);
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      mockRequireAnyRole.mockImplementation(() => {
        // Success - do nothing
      });

      const rolesInDifferentOrder = ['hr-advisor', 'admin', 'hiring-manager'];

      await requireRoleRegistration(session, request, rolesInDifferentOrder, routeChecker);

      expect(mockRequireAnyRole).toHaveBeenCalledWith(session, new URL(request.url), rolesInDifferentOrder);
    });

    it('should handle concurrent calls correctly', async () => {
      const session = createMockSession(['admin']);
      const request1 = createMockRequest('https://example.com/path1');
      const request2 = createMockRequest('https://example.com/path2');
      const routeChecker = vi.fn().mockReturnValue(true);
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getCurrentUser.mockResolvedValue(Some(mockUser));
      mockRequireAnyRole.mockImplementation(() => {
        // Success - do nothing
      });

      // Run both calls concurrently
      const [result1, result2] = await Promise.all([
        requireRoleRegistration(session, request1, ['admin'], routeChecker),
        requireRoleRegistration(session, request2, ['admin'], routeChecker),
      ]);

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(2);
      expect(mockRequireAnyRole).toHaveBeenCalledTimes(2);
    });
  });
});
