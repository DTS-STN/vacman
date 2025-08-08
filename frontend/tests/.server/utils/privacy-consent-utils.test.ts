/**
 * Tests for privacy consent utilities and flow.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { Ok, None, Some } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { createUserProfile, safeGetUserProfile } from '~/.server/utils/profile-utils';
import { loader as privacyLoader } from '~/routes/employee/profile/privacy-consent';

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

// Mock profile utils
vi.mock('~/.server/utils/profile-utils', () => ({
  createUserProfile: vi.fn(),
  ensureUserProfile: vi.fn(),
  safeGetUserProfile: vi.fn(),
}));

const mockUserService = {
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
  updateUserRole: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

const mockProfileService = {
  getProfile: vi.fn(),
  getProfileById: vi.fn(),
  registerProfile: vi.fn(),
  updateProfile: vi.fn(),
  submitProfileForReview: vi.fn(),
  getAllProfiles: vi.fn(),
  getCurrentUserProfile: vi.fn(),
};

const mockProfile: Profile = {
  profileId: 1,
  userId: 1,
  profileStatusId: 1,
  privacyConsentInd: true,
  userCreated: 'system',
  dateCreated: new Date().toISOString(),
  personalInformation: {
    surname: 'Doe',
    givenName: 'John',
    personalRecordIdentifier: '123456789',
    preferredLanguageId: undefined,
    workEmail: 'work.email@example.ca',
    personalEmail: 'personal.email@example.com',
    workPhone: undefined,
    personalPhone: '613-938-0001',
    additionalInformation: 'Looking for opportunities in software development.',
  },
  employmentInformation: {
    substantivePosition: undefined,
    branchOrServiceCanadaRegion: undefined,
    directorate: undefined,
    province: undefined,
    cityId: undefined,
    wfaStatus: undefined,
    wfaEffectiveDate: undefined,
    wfaEndDate: undefined,
    hrAdvisor: undefined,
  },
  referralPreferences: {
    languageReferralTypeIds: [864190000],
    classificationIds: [905190000, 905190001],
    workLocationProvince: 1,
    workLocationCitiesIds: [411290001, 411290002],
    availableForReferralInd: true,
    interestedInAlternationInd: false,
    employmentTenureIds: [664190000, 664190001, 664190003],
  },
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
    mockUserService.getCurrentUser.mockResolvedValue(null);
    // Default: no profile exists
    mockProfileService.getProfile.mockResolvedValue(null);
    // Mock createUserProfile to return a profile with profileId
    vi.mocked(createUserProfile).mockResolvedValue(Ok(mockProfile));
    // Default: safeGetUserProfile returns null
    mockSafeGetUserProfile.mockResolvedValue(null);
  });

  describe('Employee Privacy Consent Flow', () => {
    it('should load privacy consent page successfully', async () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/employee/profile/privacy-consent');

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

      mockProfileService.getCurrentUserProfile.mockResolvedValue(
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

      // Mock that profile exists but privacy consent is not accepted
      mockProfileService.getCurrentUserProfile.mockResolvedValue(
        Some({
          profileId: 2,
          userId: 2,
          profileStatusId: 1,
          privacyConsentInd: false,
          userCreated: 'test-user-no-consent',
          dateCreated: '2024-01-01T00:00:00Z',
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
        },
      } as unknown as AuthenticatedSession;

      // Mock that no profile exists
      mockProfileService.getCurrentUserProfile.mockResolvedValue(None);

      // Act & Assert - should throw redirect
      await expect(requirePrivacyConsent(mockSession, new URL('http://localhost:3000/en/employee'))).rejects.toThrow();
    });
  });
});
