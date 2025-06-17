/**
 * Tests for the current privacy consent and dashboard selection functionality.
 */
import type { AppLoadContext } from 'react-router';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { requirePrivacyConsent } from '~/.server/utils/privacy-consent-utils';
import { action as privacyAction } from '~/routes/employee/privacy-consent';
import { action as indexAction } from '~/routes/index';

// Mock the user service
vi.mock('~/.server/domain/services/user-service');

// Mock i18n configuration
vi.mock('~/i18n-config.server', () => ({
  getTranslation: vi.fn().mockImplementation(() => {
    const mockT = vi.fn((key: string) => key);
    return {
      lang: 'en' as const,
      t: mockT,
    };
  }),
}));

// Mock i18nRedirect function
vi.mock('~/.server/utils/route-utils', () => ({
  i18nRedirect: vi.fn((routeId: string) => {
    // Simple mock redirect based on route
    const redirectPaths: Record<string, string> = {
      'routes/index.tsx': '/en/',
      'routes/employee/index.tsx': '/en/employee',
      'routes/employee/privacy-consent.tsx': '/en/employee/privacy-consent',
      'routes/hiring-manager/index.tsx': '/en/hiring-manager',
    };
    return new Response(null, {
      status: 302,
      headers: { Location: redirectPaths[routeId] ?? '/en/' },
    });
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

describe('Current Privacy Consent and Dashboard Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Selection (Index Route)', () => {
    it('should register new employee and redirect to privacy consent', async () => {
      // Arrange: New user selecting employee dashboard
      const context = createMockContext('test-employee-123', 'Jane Employee');
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null); // User doesn't exist

      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Act
      const response = await indexAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee/privacy-consent');
      expect(mockUserService.getUserByActiveDirectoryId).toHaveBeenCalledWith('test-employee-123');
      expect(mockUserService.registerUser).not.toHaveBeenCalled(); // Should not register yet
    });

    it('should redirect existing employee to employee dashboard', async () => {
      // Arrange: Existing employee user
      const context = createMockContext('test-employee-456', 'John Employee');
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
        id: 1,
        name: 'John Employee',
        activeDirectoryId: 'test-employee-456',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });

      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'employee' }),
      });

      // Act
      const response = await indexAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should register new hiring manager immediately and redirect', async () => {
      // Arrange: New user selecting hiring manager dashboard
      const context = createMockContext('test-manager-789', 'Jane Manager');
      mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null); // User doesn't exist
      mockUserService.registerUser.mockResolvedValue({
        id: 2,
        name: 'Jane Manager',
        activeDirectoryId: 'test-manager-789',
        role: 'hiring-manager',
        createdBy: 'system',
        createdDate: new Date().toISOString(),
        lastModifiedBy: 'system',
        lastModifiedDate: new Date().toISOString(),
      });

      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'hiring-manager' }),
      });

      // Act
      const response = await indexAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/hiring-manager');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Jane Manager',
          activeDirectoryId: 'test-manager-789',
          role: 'hiring-manager',
        },
        expect.any(Object),
      );
    });

    it('should return 400 for invalid dashboard selection', async () => {
      // Arrange
      const context = createMockContext('test-user-999', 'Test User');
      const request = new Request('http://localhost:3000/en/', {
        method: 'POST',
        body: new URLSearchParams({ dashboard: 'invalid' }),
      });

      // Act
      const response = await indexAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Invalid dashboard selection');
    });
  });

  describe('Privacy Consent Route', () => {
    it('should register employee when privacy consent is accepted', async () => {
      // Arrange
      const context = createMockContext('test-employee-consent', 'Employee Consent');
      mockUserService.registerUser.mockResolvedValue({
        id: 3,
        name: 'Employee Consent',
        activeDirectoryId: 'test-employee-consent',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: new Date().toISOString(),
        lastModifiedBy: 'system',
        lastModifiedDate: new Date().toISOString(),
      });

      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      // Act
      const response = await privacyAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/employee');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Employee Consent',
          activeDirectoryId: 'test-employee-consent',
          role: 'employee',
          privacyConsentAccepted: true,
        },
        expect.any(Object),
      );
    });

    it('should redirect to index when privacy consent is declined', async () => {
      // Arrange
      const context = createMockContext('test-employee-decline', 'Employee Decline');
      const request = new Request('http://localhost:3000/en/employee/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'decline' }),
      });

      // Act
      const response = await privacyAction({ context, request, params: {} });

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
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
});
