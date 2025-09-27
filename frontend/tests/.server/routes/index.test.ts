/**
 * Tests for index dashboard selection and routing flow.
 */
import type { RouterContextProvider } from 'react-router';
import { redirect } from 'react-router';

import { None } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getProfileService } from '~/.server/domain/services/profile-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { requireAuthentication } from '~/.server/utils/auth-utils';
import { loader as indexLoader } from '~/routes/index';

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
  getFixedT: vi.fn(() => (lng: string, ns: string) => (key: string) => `${key} - ${lng}`),
  getTranslation: vi.fn().mockImplementation((request: Request, namespace: string) => {
    const mockT = vi.fn((key: string) => key);
    return {
      lang: 'en' as const,
      t: mockT,
    };
  }),
}));

// Mock the auth-utils module
vi.mock('~/.server/utils/auth-utils', () => ({
  requireAuthentication: vi.fn(),
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
  updateProfileStatus: vi.fn(),
  findProfileById: vi.fn(),
};

vi.mocked(getProfileService).mockReturnValue(mockProfileService);

// Helper to create mock context
function createMockContext(): RouterContextProvider {
  const mockSession = mock<AppSession>();
  return mock<RouterContextProvider>({
    get: vi.fn().mockReturnValue({ session: mockSession }),
  });
}

describe('Index Dashboard Selection Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuthentication).mockReturnValue(undefined);
    // Default: user is not registered
    mockUserService.getCurrentUser.mockResolvedValue(None);
    // Default: no profile exists
    mockProfileService.findCurrentUserProfile.mockRejectedValue(new Error('No profile found'));
  });

  describe('Index Loader', () => {
    it('should load index page successfully', async () => {
      const context = createMockContext();
      const request = new Request('http://localhost:3000/en/');

      const response = await indexLoader({ context, request, params: {} } as TestRouteArgs);

      expect(response).toEqual({
        documentTitle: expect.any(String),
      });

      const { session } = context.get(context.applicationContext);
      expect(requireAuthentication).toHaveBeenCalledWith(session, request);
    });
  });

  it('should handle authentication redirect if not authenticated', async () => {
    // Mock requireAuthentication to throw a redirect
    vi.mocked(requireAuthentication).mockImplementation(() => {
      throw redirect('/login');
    });

    const context = createMockContext();
    const request = new Request('http://localhost:3000/en/');

    let error: unknown;
    try {
      await indexLoader({ context, request, params: {} } as TestRouteArgs);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(302);
    expect((error as Response).headers.get('Location')).toBe('/login');
  });
});
