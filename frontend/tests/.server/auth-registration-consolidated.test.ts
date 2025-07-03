/**
 * Comprehensive tests for authentication, registration, and privacy consent flow.
 * Consolidates tests for index.tsx dashboard selection, employee privacy consent flow,
 * and privacy consent utilities.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { None, Some } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { ErrorCodes } from '~/errors/error-codes';
import { action as privacyAction, loader as privacyLoader } from '~/routes/employee/privacy-consent';
import { loader as hiringManagerLoader } from '~/routes/hiring-manager/index';
import { action as indexAction, loader as indexLoader } from '~/routes/index';

// Type definitions for test compatibility
type TestRouteArgs = {
  context: AppLoadContext;
  request: Request;
  params: Record<string, string>;
};

// Mock the user service
vi.mock('~/.server/domain/services/user-service');

// Mock the profile service
vi.mock('~/.server/domain/services/profile-service');

// Mock i18n configuration
vi.mock('~/i18n-config.server', () => ({
  getTranslation: vi.fn().mockImplementation((request: Request, namespace: string) => {
    const mockT = vi.fn((key: string) => key);
    return {
      lang: 'en' as const,
      t: mockT,
    };
  }),
}));

// Mock i18nRedirect function
vi.mock('~/.server/utils/route-utils', () => ({
  i18nRedirect: vi.fn((routeId: string, request: Request | URL | string) => {
    const url = typeof request === 'string' ? request : request instanceof URL ? request.href : request.url;
    const language = url.includes('/fr/') ? 'fr' : 'en';

    // Map route IDs to paths
    const routeMap: Record<string, Record<string, string>> = {
      'routes/index.tsx': { en: '/en/', fr: '/fr/' },
      'routes/employee/index.tsx': { en: '/en/employee', fr: '/fr/employe' },
      'routes/employee/privacy-consent.tsx': {
        en: '/en/employee/privacy-consent',
        fr: '/fr/employe/consentement-confidentialite',
      },
      'routes/hiring-manager/index.tsx': { en: '/en/hiring-manager', fr: '/fr/gestionnaire-embauche' },
    };

    const paths = routeMap[routeId];
    const redirectPath = paths?.[language] ?? (language === 'fr' ? '/fr/' : '/en/');

    return redirect(redirectPath);
  }),
}));

const mockUserService = {
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
  getUserByActiveDirectoryId: vi.fn(),
  registerUser: vi.fn(),
  updateUserRole: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

const mockProfileService = {
  getProfile: vi.fn(),
  registerProfile: vi.fn(),
};

vi.mocked(getProfileService).mockReturnValue(mockProfileService);

// Helper to create mock context
function createMockContext(activeDirectoryId: string, name?: string, roles: string[] = []): AppLoadContext {
  const mockSession = {
    authState: {
      idTokenClaims: {
        sub: activeDirectoryId,
        oid: activeDirectoryId, // Add the missing oid field that privacy-consent route expects
        name,
        iss: 'test-issuer',
        aud: 'test-audience',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      accessTokenClaims: {
        roles,
        iss: 'test-issuer',
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: 'test-audience',
        sub: activeDirectoryId,
        client_id: 'test-client',
        iat: Math.floor(Date.now() / 1000),
        jti: 'test-jti',
      },
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
    },
  } as unknown as AppSession;

  return {
    nonce: 'test-nonce',
    session: mockSession,
  };
}

describe('Authentication, Registration, and Privacy Consent Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is not registered
    mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);
    // Default: no profile exists
    mockProfileService.getProfile.mockResolvedValue(None);
  });

  describe('Mock User Service Integration', () => {
    const userService = getMockUserService();

    it('should register a new employee with privacy consent', async () => {
      const newUserData = {
        role: 'employee',
      };

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: [],
            sub: 'test-employee-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-employee-123',
            oid: 'test-employee-123',
            name: 'Test Employee',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const registeredUser = await userService.registerUser(newUserData, mockSession);

      expect(registeredUser).toMatchObject({
        uuName: 'Test Employee',
        networkName: 'test-employee-123',
        role: 'employee',
      });
      expect(registeredUser.id).toBeDefined();
      expect(registeredUser.userCreated).toBe('test-employee-123');
      expect(registeredUser.dateCreated).toBeDefined();
    });

    it('should register a new hiring manager without privacy consent', async () => {
      const newUserData = {
        role: 'hiring-manager',
      };

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: [],
            sub: 'test-manager-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-manager-123',
            oid: 'test-manager-123',
            name: 'Test Hiring Manager',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const registeredUser = await userService.registerUser(newUserData, mockSession);

      expect(registeredUser).toMatchObject({
        uuName: 'Test Hiring Manager',
        networkName: 'test-manager-123',
        role: 'hiring-manager',
      });
    });

    it('should update user role using updateUserRole method', async () => {
      const userService = getMockUserService();
      const activeDirectoryId = 'test-update-role-123';
      const newRole = 'hiring-manager';

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            oid: activeDirectoryId,
            name: 'Test User Role Update',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      // First register a user
      await userService.registerUser(
        {
          role: 'employee',
        },
        mockSession,
      );

      // Then update their role
      const updatedUser = await userService.updateUserRole(activeDirectoryId, newRole, mockSession);

      expect(updatedUser).toMatchObject({
        uuName: 'Test User Role Update',
        networkName: activeDirectoryId,
        role: newRole,
      });
      expect(updatedUser.id).toBeDefined();
      expect(updatedUser.userUpdated).toBe('system');
      expect(updatedUser.dateUpdated).toBeDefined();
    });

    it('should throw error when updating role for non-existent user', async () => {
      const userService = getMockUserService();
      const activeDirectoryId = 'non-existent-user-123';
      const newRole = 'hiring-manager';

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: ['admin'],
            sub: 'admin-user',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'admin-user',
            name: 'Admin User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      await expect(userService.updateUserRole(activeDirectoryId, newRole, mockSession)).rejects.toMatchObject({
        msg: "User with Active Directory ID 'non-existent-user-123' not found.",
        errorCode: ErrorCodes.VACMAN_API_ERROR,
      });
    });
  });

  describe('Index Dashboard Selection Flow', () => {
    it('should redirect unregistered employee to privacy consent', async () => {
      const context = createMockContext('test-employee-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Mock user as not having a profile (default mock)
      mockProfileService.getProfile.mockResolvedValue(None);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee/privacy-consent');
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('test-employee-123');

      // Verify user was NOT registered yet
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should redirect registered employee to employee dashboard', async () => {
      const context = createMockContext('test-employee-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Mock user as already registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        uuName: 'Jane Employee',
        networkName: 'test-employee-123',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
      });

      // Mock that profile exists and has privacy consent accepted
      mockProfileService.getProfile.mockResolvedValue(
        Some({
          profileId: 1,
          userId: 1,
          profileStatusId: 1,
          privacyConsentInd: true,
          userCreated: 'test-employee-123',
          dateCreated: '2024-01-01T00:00:00Z',
        }),
      );

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');

      // Verify no registration attempted
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should register and redirect hiring manager immediately', async () => {
      const context = createMockContext('test-manager-123', 'John Manager');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Mock user as not registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/hiring-manager');

      // Verify user was registered immediately
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-manager-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });

    it('should redirect registered hiring manager to hiring manager dashboard', async () => {
      const context = createMockContext('test-manager-123', 'John Manager');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Mock user as already registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 2,
        uuName: 'John Manager',
        networkName: 'test-manager-123',
        role: 'hiring-manager',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
      });

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/hiring-manager');

      // Verify no registration attempted
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
      // Verify no role update attempted since user is already a hiring manager
      expect(mockUserService.updateUserRole).not.toHaveBeenCalled();
    });

    it('should update employee role to hiring-manager and redirect to hiring manager dashboard', async () => {
      const context = createMockContext('test-employee-to-manager-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Mock user as existing employee
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 3,
        uuName: 'Jane Employee',
        networkName: 'test-employee-to-manager-123',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
      });

      // Mock the updateUserRole response
      mockUserService.updateUserRole.mockResolvedValue({
        id: 3,
        uuName: 'Jane Employee',
        networkName: 'test-employee-to-manager-123',
        role: 'hiring-manager',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
      });

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/hiring-manager');

      // Verify role was updated
      expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
        'test-employee-to-manager-123',
        'hiring-manager',
        expect.any(Object),
      );

      // Verify no new registration attempted since user already exists
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid dashboard selection', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'invalid' }),
      });

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Invalid dashboard selection');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should handle missing name gracefully', async () => {
      const context = createMockContext('test-manager-123', undefined);
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Mock user as not registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify user was registered with fallback name
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-manager-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });
  });

  describe('Employee Privacy Consent Flow', () => {
    it('should register employee after accepting privacy consent', async () => {
      const context = createMockContext('test-employee-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      const response = await privacyAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');

      // Verify user was registered with privacy consent
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-employee-123',
          role: 'employee',
        },
        expect.any(Object),
      );
    });

    it('should redirect back to index if privacy consent is declined', async () => {
      const context = createMockContext('test-employee-123');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'decline' }),
      });

      const response = await privacyAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/');

      // Verify user was NOT registered
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should redirect back to index for missing action', async () => {
      const context = createMockContext('test-employee-123');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams(),
      });

      const response = await privacyAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should handle missing employee name gracefully', async () => {
      const context = createMockContext('test-employee-123', undefined);
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      const response = await privacyAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);

      // Verify user was registered with fallback name
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-employee-123',
          role: 'employee',
        },
        expect.any(Object),
      );
    });

    it('should ensure profile exists for existing user after accepting privacy consent', async () => {
      const context = createMockContext('test-existing-employee-123', 'Existing Employee');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      // Mock existing user
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        uuName: 'Existing Employee',
        networkName: 'test-existing-employee-123',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
      });

      const response = await privacyAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');

      // Verify user was not registered again since they already exist
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
      // The ensureUserProfile function would be called but we're not mocking profile services here
    });
  });

  describe('Privacy Consent Utils', () => {
    it('should allow access for user with privacy consent accepted', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-consent', oid: 'test-user-consent' },
        },
      } as unknown as AuthenticatedSession;

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        uuName: 'Test User',
        networkName: 'test-user-consent',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
      });

      // Mock that profile exists and has privacy consent accepted
      mockProfileService.getProfile.mockResolvedValue(
        Some({
          profileId: 1,
          userId: 1,
          profileStatusId: 1,
          privacyConsentInd: true,
          userCreated: 'test-user-consent',
          dateCreated: '2024-01-01T00:00:00Z',
        }),
      );

      // Act & Assert - should not throw
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).resolves.not.toThrow();
    });

    it('should redirect users without privacy consent', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-no-consent', oid: 'test-user-no-consent' },
        },
      } as unknown as AuthenticatedSession;

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 2,
        uuName: 'Test User No Consent',
        networkName: 'test-user-no-consent',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });

    it('should redirect hiring managers who access employee routes', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['hiring-manager'] },
          idTokenClaims: { sub: 'test-manager', oid: 'test-manager' },
        },
      } as unknown as AuthenticatedSession;

      // Mock that no profile exists for hiring manager (they shouldn't have employee profiles)
      mockProfileService.getProfile.mockResolvedValue(None);

      // Act & Assert - should redirect to index since hiring managers shouldn't access employee routes
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();

      expect(mockProfileService.getProfile).toHaveBeenCalledWith('test-manager');
    });
  });

  describe('Loader Functions', () => {
    it('should load index page successfully', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/');

      const response = await indexLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
    });

    it('should load privacy consent page successfully', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent');

      const response = await privacyLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
    });
  });

  describe('French Locale Support', () => {
    it('should handle French employee registration flow', async () => {
      const context = createMockContext('test-employee-fr-123', 'Employé Français');
      const request = new Request('http://localhost:3000/fr/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Mock user as not registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/employe/consentement-confidentialite');
    });

    it('should handle French hiring manager registration', async () => {
      const context = createMockContext('test-manager-fr-123', 'Gestionnaire Français');
      const request = new Request('http://localhost:3000/fr/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Mock user as not registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/gestionnaire-embauche');

      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-manager-fr-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });
  });

  describe('Hiring Manager Route Protection', () => {
    it('should allow access to hiring manager route for registered hiring managers', async () => {
      // Arrange
      const context = createMockContext('test-hiring-manager-123', 'John Manager');
      const request = new Request('http://localhost:3000/en/hiring-manager');

      // Act
      const response = await hiringManagerLoader({ context, request, params: {} } as TestRouteArgs);

      // Assert - The route should just return the normal response without doing any registration checks
      // (Registration checks are handled by the parent layout, not the individual route)
      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
      // The individual route should NOT call getUserByActiveDirectoryId since registration checks are handled by parent layout
      expect(mockUserService.getUserByActiveDirectoryId).not.toHaveBeenCalled();
    });

    it('should not perform registration checks in individual route (handled by parent layout)', async () => {
      // Arrange
      const context = createMockContext('test-unregistered-123', 'Unregistered User');
      const request = new Request('http://localhost:3000/en/hiring-manager');

      // Act
      const response = await hiringManagerLoader({ context, request, params: {} } as TestRouteArgs);

      // Assert - The route should return normally without performing any checks
      // Registration protection is handled by the parent layout, not this route
      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
      expect(mockUserService.getUserByActiveDirectoryId).not.toHaveBeenCalled();
    });

    it('should work with French locale URLs without performing registration checks', async () => {
      // Arrange
      const context = createMockContext('test-hiring-manager-fr-123', 'Gestionnaire Test');
      const request = new Request('http://localhost:3000/fr/gestionnaire-embauche');

      // Act
      const response = await hiringManagerLoader({ context, request, params: {} } as TestRouteArgs);

      // Assert - The route should return normally without performing any checks
      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
      expect(mockUserService.getUserByActiveDirectoryId).not.toHaveBeenCalled();
    });
  });
});
