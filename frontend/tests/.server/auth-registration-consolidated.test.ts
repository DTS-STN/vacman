/**
 * Comprehensive tests for authentication, registration, and privacy consent flow.
 * Consolidates tests for index.tsx dashboard selection, employee privacy consent flow,
 * and privacy consent utilities.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { action as privacyAction, loader as privacyLoader } from '~/routes/employee/privacy-consent';
import { action as indexAction, loader as indexLoader } from '~/routes/index';

// Type definitions for test compatibility
type TestRouteArgs = {
  context: AppLoadContext;
  request: Request;
  params: Record<string, string>;
};

// Mock the user service
vi.mock('~/.server/domain/services/user-service');

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
  getUserById: vi.fn(),
  getUserByActiveDirectoryId: vi.fn(),
  registerUser: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

// Helper to create mock context
function createMockContext(activeDirectoryId: string, name?: string, roles: string[] = []): AppLoadContext {
  const mockSession = {
    authState: {
      idTokenClaims: {
        sub: activeDirectoryId,
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
  });

  describe('Mock User Service Integration', () => {
    const userService = getMockUserService();

    it('should register a new employee with privacy consent', async () => {
      const newUserData = {
        name: 'Test Employee',
        activeDirectoryId: 'test-employee-123',
        role: 'employee',
        privacyConsentAccepted: true,
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
        name: 'Test Employee',
        activeDirectoryId: 'test-employee-123',
        role: 'employee',
        privacyConsentAccepted: true,
      });
      expect(registeredUser.id).toBeDefined();
      expect(registeredUser.createdBy).toBe('system');
      expect(registeredUser.createdDate).toBeDefined();
    });

    it('should register a new hiring manager without privacy consent', async () => {
      const newUserData = {
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-manager-123',
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
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-manager-123',
        role: 'hiring-manager',
      });
      expect(registeredUser.privacyConsentAccepted).toBeUndefined();
    });
  });

  describe('Index Dashboard Selection Flow', () => {
    it('should redirect unregistered employee to privacy consent', async () => {
      const context = createMockContext('test-employee-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Mock user as not registered
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee/privacy-consent');
      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-employee-123');

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
        id: '1',
        name: 'Jane Employee',
        activeDirectoryId: 'test-employee-123',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: new Date(),
      });

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
          name: 'John Manager',
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
        id: '2',
        name: 'John Manager',
        activeDirectoryId: 'test-manager-123',
        role: 'hiring-manager',
        createdBy: 'system',
        createdDate: new Date(),
      });

      const response = await indexAction({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/hiring-manager');

      // Verify no registration attempted
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
          name: 'Unknown User',
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
          name: 'Jane Employee',
          activeDirectoryId: 'test-employee-123',
          role: 'employee',
          privacyConsentAccepted: true,
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
          name: 'Unknown User',
          activeDirectoryId: 'test-employee-123',
          role: 'employee',
          privacyConsentAccepted: true,
        },
        expect.any(Object),
      );
    });
  });

  describe('Privacy Consent Utils', () => {
    it('should allow access for user with privacy consent accepted', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-consent' },
        },
      } as AuthenticatedSession;

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Test User',
        activeDirectoryId: 'test-user-consent',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should not throw
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).resolves.not.toThrow();
    });

    it('should redirect users without privacy consent', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-no-consent' },
        },
      } as AuthenticatedSession;

      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 2,
        name: 'Test User No Consent',
        activeDirectoryId: 'test-user-no-consent',
        role: 'employee',
        privacyConsentAccepted: false,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });

    it('should redirect hiring managers who access employee routes', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['hiring-manager'] },
          idTokenClaims: { sub: 'test-manager' },
        },
      } as AuthenticatedSession;

      // Mock hiring manager user in database
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'Test Manager',
        activeDirectoryId: 'test-manager',
        role: 'hiring-manager',
        createdBy: 'system',
        createdDate: new Date(),
      });

      // Act & Assert - should redirect to index since hiring managers shouldn't access employee routes
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();

      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-manager');
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
          name: 'Gestionnaire Français',
          activeDirectoryId: 'test-manager-fr-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });
  });
});
