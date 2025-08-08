/**
 * Tests for hiring manager route functionality.
 */
import type { AppLoadContext } from 'react-router';
import { redirect } from 'react-router';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import { loader as hiringManagerLoader } from '~/routes/hiring-manager/index';

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
  updateUserRole: vi.fn(),
  getCurrentUser: vi.fn(),
  registerCurrentUser: vi.fn(),
  updateUser: vi.fn(),
};

vi.mocked(getUserService).mockReturnValue(mockUserService);

// Helper to create mock context
function createMockContext(activeDirectoryId: string, name?: string, roles: string[] = []): AppLoadContext {
  const mockSession = {
    authState: {
      idTokenClaims: {
        sub: activeDirectoryId,
        oid: activeDirectoryId,
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

describe('Hiring Manager Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    // The individual route should NOT call getCurrentUser since registration checks are handled by parent layout
    expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
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
    expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
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
    expect(mockUserService.getCurrentUser).not.toHaveBeenCalled();
  });
});
