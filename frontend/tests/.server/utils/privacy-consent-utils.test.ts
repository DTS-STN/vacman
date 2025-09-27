/**
 * Tests for privacy consent utilities and flow.
 */
import type { RouterContextProvider } from 'react-router';
import { redirect } from 'react-router';

import { None, Ok, Some } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { loader as privacyLoader } from '~/routes/employee/profile/privacy-consent';

// Type definitions for test compatibility
type TestRouteArgs = {
  context: RouterContextProvider;
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
      'routes/employee/profile/privacy-consent.tsx': {
        en: '/en/employee/profile/privacy-consent',
        fr: '/fr/employe/profil/consentement-confidentialite',
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

const mockUserService = {
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
  findUserById: vi.fn(),
  updateUserRole: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
  updateUser: vi.fn(),
  getUsers: vi.fn(),
  updateUserById: vi.fn(),
  createProfileForUser: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

const mockProfileService = {
  getProfiles: vi.fn(),
  getCurrentUserProfiles: vi.fn(),
  findCurrentUserProfile: vi.fn(),
  registerProfile: vi.fn(),
  getProfileById: vi.fn(),
  updateProfileById: vi.fn(),
  getProfile: vi.fn(),
  findProfileById: vi.fn(),
  updateProfileStatus: vi.fn(),
};

vi.mocked(getProfileService).mockReturnValue(mockProfileService);

// Helper to create mock context
function createMockContext(): RouterContextProvider {
  const mockSession = mock<AppSession>({
    authState: {
      accessToken: 'mock-access-token',
    },
  });

  return mock<RouterContextProvider>({
    get: vi.fn().mockReturnValue({ session: mockSession }),
  });
}

describe('Privacy Consent Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is not registered
    mockUserService.getCurrentUser.mockResolvedValue(None);
    // Default: no profile exists
    mockProfileService.getCurrentUserProfiles.mockResolvedValue(Ok({ content: [] }));
  });

  describe('Employee Privacy Consent Flow', () => {
    it('should load privacy consent page successfully', async () => {
      const context = createMockContext();
      const request = new Request('http://localhost:3000/en/employee/profile/privacy-consent');

      const response = await privacyLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toEqual({
        documentTitle: expect.any(String),
        lang: expect.any(String),
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
          accessToken: 'mock-access-token',
        },
        currentUser: {
          id: 1,
        },
      } as unknown as AuthenticatedSession;

      mockProfileService.getCurrentUserProfiles.mockResolvedValue(
        Ok({
          content: [
            {
              id: 1,
              profileUser: { id: 1 },
              hasConsentedToPrivacyTerms: true,
              createdBy: 'test-user-consent',
              createdDate: '2024-01-01T00:00:00Z',
            },
          ],
        }),
      );

      mockUserService.getCurrentUser.mockResolvedValue(
        Some({
          id: 1,
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
          accessToken: 'mock-access-token',
        },
      } as unknown as AuthenticatedSession;

      // Mock that profile exists but privacy consent is not accepted
      mockProfileService.getCurrentUserProfiles.mockResolvedValue(
        Ok({
          content: [
            {
              id: 2,
              profileUser: { id: 2 },
              hasConsentedToPrivacyTerms: false,
              createdBy: 'test-user-no-consent',
              createdDate: '2024-01-01T00:00:00Z',
            },
          ],
        }),
      );

      mockUserService.getCurrentUser.mockResolvedValue(
        Some({
          id: 2,
        }),
      );

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });

    it('should redirect users with no profile', async () => {
      // Arrange
      const mockSession = {
        authState: {
          accessTokenClaims: { roles: ['employee'] },
          idTokenClaims: { sub: 'test-user-no-profile', oid: 'test-user-no-profile' },
          accessToken: 'mock-access-token',
        },
      } as unknown as AuthenticatedSession;

      // Mock that no profile exists
      mockProfileService.getCurrentUserProfiles.mockResolvedValue(
        Ok({
          content: [],
        }),
      );

      mockUserService.getCurrentUser.mockResolvedValue(
        Some({
          id: 3,
        }),
      );

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });
  });
});
