/**
 * Tests for index dashboard selection and routing flow.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { None, Some } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
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
  updateUserRole: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

const mockProfileService = {
  getProfile: vi.fn(),
  registerProfile: vi.fn(),
  updatePersonalInformation: vi.fn(),
  updateEmploymentInformation: vi.fn(),
  updateReferralPreferences: vi.fn(),
  submitProfileForReview: vi.fn(),
  getAllProfiles: vi.fn(),
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

describe('Index Dashboard Selection Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is not registered
    mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);
    // Default: no profile exists
    mockProfileService.getProfile.mockResolvedValue(None);
  });

  describe('Employee Dashboard Selection', () => {
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
      expect(mockUserService.registerCurrentUser).not.toHaveBeenCalled();
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
      expect(mockUserService.registerCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Hiring Manager Dashboard Selection', () => {
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
      expect(mockUserService.registerCurrentUser).toHaveBeenCalledWith(
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
      expect(mockUserService.registerCurrentUser).not.toHaveBeenCalled();
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
      expect(mockUserService.registerCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Dashboard Selection Edge Cases', () => {
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
      expect(mockUserService.registerCurrentUser).not.toHaveBeenCalled();
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
      expect(mockUserService.registerCurrentUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-manager-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });
  });

  describe('Index Loader', () => {
    it('should load index page successfully', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/');

      const response = await indexLoader({ context, request, params: {} } as TestRouteArgs);

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

      expect(mockUserService.registerCurrentUser).toHaveBeenCalledWith(
        {
          activeDirectoryId: 'test-manager-fr-123',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });
  });
});
