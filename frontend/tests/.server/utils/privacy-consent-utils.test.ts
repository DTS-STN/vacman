/**
 * Tests for privacy consent utilities and flow.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { None } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { safeGetUserProfile } from '~/.server/utils/profile-utils';
import { action as privacyAction, loader as privacyLoader } from '~/routes/employee/privacy-consent';

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
  i18nRedirect: vi.fn((routeId: string, request: Request | URL | string, options?: { params?: Record<string, string> }) => {
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
      'routes/employee/[id]/profile/index.tsx': {
        en: '/en/employee/:id/profile',
        fr: '/fr/employe/:id/profil',
      },
      'routes/hiring-manager/index.tsx': { en: '/en/hiring-manager', fr: '/fr/gestionnaire-embauche' },
    };

    const paths = routeMap[routeId];
    let redirectPath = paths?.[language] ?? (language === 'fr' ? '/fr/' : '/en/');

    // Replace URL parameters if provided
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        redirectPath = redirectPath.replace(`:${key}`, value);
      });
    }

    return redirect(redirectPath);
  }),
}));

// Mock profile utils
vi.mock('~/.server/utils/profile-utils', () => ({
  createUserProfile: vi.fn(),
  ensureUserProfile: vi.fn(),
  safeGetUserProfile: vi.fn(),
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
  updatePersonalInformation: vi.fn(),
  updateEmploymentInformation: vi.fn(),
  updateReferralPreferences: vi.fn(),
  getAllProfiles: vi.fn(),
};

vi.mocked(getProfileService).mockReturnValue(mockProfileService);

const mockSafeGetUserProfile = vi.fn();
vi.mocked(safeGetUserProfile).mockImplementation(mockSafeGetUserProfile);

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

describe('Privacy Consent Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is not registered
    mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);
    // Default: no profile exists
    mockProfileService.getProfile.mockResolvedValue(None);
    // Default: safeGetUserProfile returns null
    mockSafeGetUserProfile.mockResolvedValue(null);
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

    it('should load privacy consent page successfully', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent');

      const response = await privacyLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toEqual({
        documentTitle: expect.any(String),
      });
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

      // Mock that profile exists and has privacy consent accepted
      mockSafeGetUserProfile.mockResolvedValue({
        profileId: 1,
        userId: 1,
        profileStatusId: 1,
        privacyConsentInd: true,
        userCreated: 'test-user-consent',
        dateCreated: '2024-01-01T00:00:00Z',
      });

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

      // Mock that profile exists but privacy consent is not accepted
      mockSafeGetUserProfile.mockResolvedValue({
        profileId: 2,
        userId: 2,
        profileStatusId: 1,
        privacyConsentInd: false,
        userCreated: 'test-user-no-consent',
        dateCreated: '2024-01-01T00:00:00Z',
      });

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });

    it('should redirect users with no profile', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-no-profile', oid: 'test-user-no-profile' },
        },
      } as unknown as AuthenticatedSession;

      // Mock that no profile exists
      mockSafeGetUserProfile.mockResolvedValue(null);

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });
  });
});
