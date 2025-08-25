/**
 * Tests for index dashboard selection and routing flow.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { None } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { loader as indexLoader } from '~/routes/index';

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
    };

    const paths = routeMap[routeId];
    const redirectPath = paths?.[language] ?? (language === 'fr' ? '/fr/' : '/en/');

    return redirect(redirectPath);
  }),
}));

const mockUserService = {
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  findUserById: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
  updateUserById: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

const mockProfileService = {
  getProfiles: vi.fn(),
  getCurrentUserProfiles: vi.fn(),
  findCurrentUserProfile: vi.fn(),
  registerProfile: vi.fn(),
  getProfileById: vi.fn(),
  updateProfileById: vi.fn(),
  updateProfileStatus: vi.fn(),
  findProfileById: vi.fn(),
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
    mockUserService.getCurrentUser.mockResolvedValue(None);
    // Default: no profile exists
    mockProfileService.findCurrentUserProfile.mockRejectedValue(new Error('No profile found'));
  });

  describe('Index Loader', () => {
    it('should load index page successfully', () => {
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/');

      const response = indexLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');
    });
  });
});
