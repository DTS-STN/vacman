/**
 * Comprehensive tests for the authentication and registration flow.
 * This consolidates all authentication, registration, and edge case testing.
 */
import type { AppLoadContext } from 'react-router';

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getUserService } from '~/.server/domain/services/user-service';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { isRegistrationPath } from '~/.server/utils/user-registration-utils';
import { action as registerAction, loader as registerLoader } from '~/routes/register/index';
import { action as privacyAction, loader as privacyLoader } from '~/routes/register/privacy-consent';

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

      const registeredUser = await userService.registerUser(newUserData);

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
      await userService.registerUser(newUserData);

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

      const newUser = await userService.registerUser(registrationData);
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
      expect(response.headers.get('Location')).toBe('/en/');

      // Verify user was registered
      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: 'Jane Employee',
        activeDirectoryId: 'test-user-123',
      });
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
    it('should register hiring manager immediately and redirect to dashboard', async () => {
      // Arrange
      const context = createMockContext('test-manager-456', 'John Manager');
      const request = new Request('http://localhost:3000/en/register?returnto=%2Fen%2Fdashboard', {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/en/dashboard');

      // Verify user was registered immediately
      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: 'John Manager',
        activeDirectoryId: 'test-manager-456',
      });
    });

    it('should default to dashboard if no returnto parameter', async () => {
      // Arrange
      const context = createMockContext('test-manager-789', 'Default Manager');
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

      // Verify user was registered
      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: 'Default Manager',
        activeDirectoryId: 'test-manager-789',
      });
    });
  });

  describe('Access Control', () => {
    describe('Registration Page Access', () => {
      it('should allow access to unregistered users', async () => {
        // Arrange
        const context = createMockContext('unregistered-user');
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
        expect(mockUserService.registerUser).toHaveBeenCalledWith({
          name: 'Unknown User',
          activeDirectoryId: 'test-user-123',
        });
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

  describe('Return URL Handling', () => {
    it('should preserve complex return URLs for hiring manager', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Complex Manager');
      const returnUrl = '/en/profile?tab=employment&section=details';
      const request = new Request(`http://localhost:3000/en/register?returnto=${encodeURIComponent(returnUrl)}`, {
        method: 'POST',
        body: new URLSearchParams({ role: 'hiring-manager' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(returnUrl);
      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: 'Complex Manager',
        activeDirectoryId: 'test-user-123',
      });
    });

    it('should preserve return URLs through employee privacy consent flow', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Flow Employee');
      const returnUrl = '/en/dashboard';
      const request = new Request(`http://localhost:3000/en/register?returnto=${encodeURIComponent(returnUrl)}`, {
        method: 'POST',
        body: new URLSearchParams({ role: 'employee' }),
      });

      // Act
      const response = await registerAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(`/en/register/privacy-consent?returnto=${encodeURIComponent(returnUrl)}`);
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should use preserved return URL after employee accepts privacy consent', async () => {
      // Arrange
      const context = createMockContext('test-user-123', 'Final Employee');
      const returnUrl = '/en/dashboard';
      const request = new Request(
        `http://localhost:3000/en/register/privacy-consent?returnto=${encodeURIComponent(returnUrl)}`,
        {
          method: 'POST',
          body: new URLSearchParams({ action: 'accept' }),
        },
      );

      // Act
      const response = await privacyAction({ context, request } as TestRouteArgs);

      // Assert
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(returnUrl);
      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: 'Final Employee',
        activeDirectoryId: 'test-user-123',
      });
    });
  });
});
