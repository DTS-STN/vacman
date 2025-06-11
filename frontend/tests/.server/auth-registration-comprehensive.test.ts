/**
 * Comprehensive tests for the authentication and registration flow.
 * This consolidates all authentication, registration, and edge case testing.
 */
import type { AppLoadContext } from 'react-router';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { isRegistrationPath } from '~/.server/utils/user-registration-utils';
// Import the route definitions directly to use in our mock
import { i18nRoutes } from '~/i18n-routes';
import { action as registerAction, loader as registerLoader } from '~/routes/register/index';
import { action as privacyAction, loader as privacyLoader } from '~/routes/register/privacy-consent';
import { getLanguage } from '~/utils/i18n-utils';
import { findRouteByFile } from '~/utils/route-utils';

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

// Mock i18nRedirect function to use actual route definitions
vi.mock('~/.server/utils/route-utils', () => ({
  i18nRedirect: vi.fn((routeId: string, request: Request | URL | string) => {
    // Determine language from the request
    const language = getLanguage(request) ?? 'en';

    // Use the actual route finding logic to get the route
    const route = findRouteByFile(routeId, i18nRoutes);

    // If route is found, use its path; otherwise fall back to default
    const redirectPath = route?.paths[language] ?? (language === 'fr' ? '/fr/' : '/en/');

    // Return a Response object for redirection
    return new Response(null, {
      status: 302,
      headers: { Location: redirectPath },
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
function createMockContext(activeDirectoryId: string, name?: string): AppLoadContext {
  // Create a mock session that satisfies the AppSession type
  const mockSession = {
    // Express session properties
    id: 'mock-session-id',
    cookie: {
      expires: new Date(Date.now() + 3600000), // 1 hour from now
      secure: false,
      httpOnly: true,
      maxAge: 3600000,
      originalMaxAge: 3600000,
      resetMaxAge: vi.fn(),
    },
    regenerate: vi.fn((callback?: (err?: unknown) => void) => {
      if (callback) callback();
      return mockSession;
    }),
    destroy: vi.fn((callback?: (err?: unknown) => void) => {
      if (callback) callback();
    }),
    reload: vi.fn((callback?: (err?: unknown) => void) => {
      if (callback) callback();
      return mockSession;
    }),
    save: vi.fn((callback?: (err?: unknown) => void) => {
      if (callback) callback();
      return mockSession;
    }),
    touch: vi.fn(() => mockSession),
    resetMaxAge: vi.fn(),
    // Custom session data
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
        roles: ['employee'],
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

describe('Authentication and Registration Flow - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is not registered
    mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);
  });

  describe('Utility Functions', () => {
    describe('isRegistrationPath', () => {
      it('should identify registration paths correctly', () => {
        expect(isRegistrationPath(new URL('http://localhost:3000/en/register'))).toBe(true);
        expect(isRegistrationPath(new URL('http://localhost:3000/en/register/privacy-consent'))).toBe(true);
        expect(isRegistrationPath(new URL('http://localhost:3000/fr/enregistrer'))).toBe(true);
        expect(isRegistrationPath(new URL('http://localhost:3000/fr/enregistrer/consentement-a-la-confidentialite'))).toBe(
          true,
        );
        expect(isRegistrationPath(new URL('http://localhost:3000/en/dashboard'))).toBe(false);
        expect(isRegistrationPath(new URL('http://localhost:3000/en/'))).toBe(false);
      });
    });
  });

  describe('Mock User Service Integration', () => {
    const userService = getMockUserService();

    it('should register a new user successfully', async () => {
      const newUserData = {
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-ad-id-123',
      };

      // Create a mock session for testing
      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: ['hiring-manager'],
            sub: 'test-ad-id-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-ad-id-123',
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

      const registeredUser = await userService.registerUser(newUserData, mockSession, 'hiring-manager');

      expect(registeredUser).toMatchObject({
        name: 'Test Hiring Manager',
        activeDirectoryId: 'test-ad-id-123',
      });
      expect(registeredUser.id).toBeDefined();
      expect(registeredUser.createdBy).toBe('system');
      expect(registeredUser.createdDate).toBeDefined();
    });

    it('should find user by activeDirectoryId after registration', async () => {
      const newUserData = {
        name: 'Test User for Lookup',
        activeDirectoryId: 'test-ad-lookup-456',
      };

      // Register the user
      const mockSession2 = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: 'test-ad-lookup-456',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-ad-lookup-456',
            name: 'Test User for Lookup',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      await userService.registerUser(newUserData, mockSession2, 'employee');

      // Try to find them by Active Directory ID
      const foundUser = await userService.getUserByActiveDirectoryId('test-ad-lookup-456');

      expect(foundUser).toBeTruthy();
      expect(foundUser?.name).toBe('Test User for Lookup');
      expect(foundUser?.activeDirectoryId).toBe('test-ad-lookup-456');
    });

    it('should return null for non-existent activeDirectoryId', async () => {
      const nonExistentUser = await userService.getUserByActiveDirectoryId('non-existent-id');
      expect(nonExistentUser).toBeNull();
    });

    it('should simulate complete flow for new user', async () => {
      const mockActiveDirectoryId = 'new-user-789';

      // Step 1: Check if user exists (should be null for new user)
      const existingUser = await userService.getUserByActiveDirectoryId(mockActiveDirectoryId);
      expect(existingUser).toBeNull();

      // Step 2: Register the user
      const registrationData = {
        name: 'New Hiring Manager',
        activeDirectoryId: mockActiveDirectoryId,
      };

      const mockSession3 = {
        authState: {
          accessTokenClaims: {
            roles: ['hiring-manager'],
            sub: mockActiveDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: mockActiveDirectoryId,
            name: 'New Hiring Manager',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const newUser = await userService.registerUser(registrationData, mockSession3, 'hiring-manager');
      expect(newUser).toBeTruthy();
      expect(newUser.activeDirectoryId).toBe(mockActiveDirectoryId);

      // Step 3: Verify user can now be found
      const foundUser = await userService.getUserByActiveDirectoryId(mockActiveDirectoryId);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(newUser.id);
    });
  });

  describe('Employee Registration Flow', () => {
    it('should redirect to privacy consent without registering for employee role', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/register', {
        method: 'POST',
        body: new URLSearchParams({ role: 'employee' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/register/privacy-consent');

      // Verify user was NOT registered yet
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should register employee after accepting privacy consent', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Jane Employee');
      const request = new Request('http://localhost:3000/en/register/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      // Act
      const response = await privacyAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/profile');

      // Verify user was registered
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Jane Employee',
          activeDirectoryId: 'test-user-123',
        },
        expect.any(Object), // session object
        'employee',
      );
    });

    it('should redirect back to registration if privacy consent is declined', async () => {
      // Arrange
      const context = createMockContext('test-user-123');
      const request = new Request('http://localhost:3000/en/register/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'decline' }),
      });

      // Act
      const response = await privacyAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/register');

      // Verify user was NOT registered
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });
  });

  describe('Hiring Manager Registration Flow', () => {
    it('should register hiring manager immediately and redirect to home page', async () => {
      // Arrange
      const context = createMockContext('test-manager-456', 'John Manager');
      const request = new Request('http://localhost:3000/en/register', {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/');

      // Verify user was registered immediately
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'John Manager',
          activeDirectoryId: 'test-manager-456',
        },
        expect.any(Object), // session object
        'hiring-manager',
      );
    });

    it('should work with French locale', async () => {
      // Arrange
      const context = createMockContext('test-manager-789', 'French Manager');
      const request = new Request('http://localhost:3000/fr/enregistrer', {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/');

      // Verify user was registered
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'French Manager',
          activeDirectoryId: 'test-manager-789',
        },
        expect.any(Object), // session object
        'hiring-manager',
      );
    });
  });

  describe('Access Control', () => {
    describe('Registration Page Access', () => {
      it('should allow access to unregistered users', async () => {
        // Arrange
        const context = createMockContext('unregistered-user');
        // Override the roles to simulate an unregistered user
        context.session.authState.accessTokenClaims.roles = [];

        const request = new Request('http://localhost:3000/en/register');

        // Mock user as not registered
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

        // Act
        const response = await registerLoader({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toEqual({
          documentTitle: expect.any(String),
        });
      });

      it('should redirect registered users away from registration page', async () => {
        // Arrange
        const context = createMockContext('registered-user');
        const request = new Request('http://localhost:3000/en/register');

        // Mock user as already registered
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
          id: '1',
          name: 'Already Registered',
          activeDirectoryId: 'registered-user',
          createdBy: 'system',
          createdDate: new Date(),
        });

        // Act & Assert
        await expect(registerLoader({ context, request } as TestRouteArgs)).rejects.toThrow();
      });
    });

    describe('Privacy Consent Page Access', () => {
      it('should allow access to unregistered users', async () => {
        // Arrange
        const context = createMockContext('unregistered-user');
        // Override the roles to simulate an unregistered user
        context.session.authState.accessTokenClaims.roles = [];

        const request = new Request('http://localhost:3000/en/register/privacy-consent');

        // Mock user as not registered
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue(null);

        // Act
        const response = await privacyLoader({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toEqual({
          documentTitle: expect.any(String),
        });
      });

      it('should redirect registered users away from privacy consent page', async () => {
        // Arrange
        const context = createMockContext('registered-user');
        const request = new Request('http://localhost:3000/en/register/privacy-consent');

        // Mock user as already registered
        mockUserService.getUserByActiveDirectoryId.mockResolvedValue({
          id: '1',
          name: 'Already Registered',
          activeDirectoryId: 'registered-user',
          createdBy: 'system',
          createdDate: new Date(),
        });

        // Act & Assert
        await expect(privacyLoader({ context, request } as TestRouteArgs)).rejects.toThrow();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('Invalid Role Selection', () => {
      it('should return 400 for invalid role', async () => {
        // Arrange
        const context = createMockContext('test-user-123');
        const request = new Request('http://localhost:3000/en/register', {
          method: 'POST',
          body: new URLSearchParams({ role: 'invalid-role' }),
        });

        // Act
        const response = await registerAction({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(400);
        expect(await response.text()).toBe('Invalid role selection');
        expect(mockUserService.registerUser).not.toHaveBeenCalled();
      });

      it('should return 400 for missing role', async () => {
        // Arrange
        const context = createMockContext('test-user-123');
        const request = new Request('http://localhost:3000/en/register', {
          method: 'POST',
          body: new URLSearchParams(),
        });

        // Act
        const response = await registerAction({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(400);
        expect(await response.text()).toBe('Invalid role selection');
        expect(mockUserService.registerUser).not.toHaveBeenCalled();
      });
    });

    describe('Missing User Information', () => {
      it('should handle missing user name gracefully', async () => {
        // Arrange
        const context = createMockContext('test-user-123', undefined);
        const request = new Request('http://localhost:3000/en/register', {
          method: 'POST',
          body: new URLSearchParams({ role: 'hiring-manager' }),
        });

        // Act
        const response = await registerAction({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);

        // Verify user was registered with fallback name
        expect(mockUserService.registerUser).toHaveBeenCalledWith(
          {
            name: 'Unknown User',
            activeDirectoryId: 'test-user-123',
          },
          expect.any(Object), // session object
          'hiring-manager',
        );
      });
    });

    describe('Privacy Consent Edge Cases', () => {
      it('should handle missing action gracefully', async () => {
        // Arrange
        const context = createMockContext('test-user-123');
        const request = new Request('http://localhost:3000/en/register/privacy-consent', {
          method: 'POST',
          body: new URLSearchParams(),
        });

        // Act
        const response = await privacyAction({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/en/register');
        expect(mockUserService.registerUser).not.toHaveBeenCalled();
      });

      it('should handle unknown action gracefully', async () => {
        // Arrange
        const context = createMockContext('test-user-123');
        const request = new Request('http://localhost:3000/en/register/privacy-consent', {
          method: 'POST',
          body: new URLSearchParams({ action: 'unknown' }),
        });

        // Act
        const response = await privacyAction({ context, request } as TestRouteArgs);

        // Assert
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('/en/register');
        expect(mockUserService.registerUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('Registration Flow Redirects', () => {
    it('should properly redirect hiring manager to home page after registration (English)', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Hiring Manager');
      const request = new Request('http://localhost:3000/en/register', {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Hiring Manager',
          activeDirectoryId: 'test-user-123',
        },
        expect.any(Object), // session object
        'hiring-manager',
      );
    });

    it('should properly redirect hiring manager to home page after registration (French)', async () => {
      // Arrange
      const context = createMockContext('test-user-fr-123', 'Gestionnaire de recrutement');
      const request = new Request('http://localhost:3000/fr/enregistrer', {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Gestionnaire de recrutement',
          activeDirectoryId: 'test-user-fr-123',
        },
        expect.any(Object), // session object
        'hiring-manager',
      );
    });

    it('should correctly redirect employee role to privacy consent page (English)', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Employee User');
      const request = new Request('http://localhost:3000/en/register', {
        method: 'POST',
        body: new URLSearchParams({ role: 'employee' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/register/privacy-consent');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should correctly redirect employee role to privacy consent page (French)', async () => {
      // Arrange
      const context = createMockContext('test-user-fr-123', 'Employé');
      const request = new Request('http://localhost:3000/fr/enregistrer', {
        method: 'POST',
        body: new URLSearchParams({ role: 'employee' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/enregistrer/consentement-a-la-confidentialite');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should redirect to profile page when employee accepts privacy consent (English)', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Privacy Accepting Employee');
      const request = new Request('http://localhost:3000/en/register/privacy-consent', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      // Act
      const response = await privacyAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/profile');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Privacy Accepting Employee',
          activeDirectoryId: 'test-user-123',
        },
        expect.any(Object), // session object
        'employee',
      );
    });

    it('should redirect to profile page when employee accepts privacy consent (French)', async () => {
      // Arrange
      const context = createMockContext('test-user-fr-123', 'Employé acceptant la confidentialité');
      const request = new Request('http://localhost:3000/fr/enregistrer/consentement-a-la-confidentialite', {
        method: 'POST',
        body: new URLSearchParams({ action: 'accept' }),
      });

      // Act
      const response = await privacyAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/fr/profil');
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        {
          name: 'Employé acceptant la confidentialité',
          activeDirectoryId: 'test-user-fr-123',
        },
        expect.any(Object), // session object
        'employee',
      );
    });
  });
});
