/**
 * Integration tests for user service functionality including registration and role updates.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

describe('User Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mock User Service', () => {
    const userService = getMockUserService();

    it('should register a new employee', async () => {
      const newUserData = {
        role: 'employee',
        languageId: 1,
      };

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: [],
            sub: 'test-employee-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-employee-123',
            oid: 'test-employee-123',
            name: 'Test Employee',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const registeredUserResult = await userService.registerCurrentUser(newUserData, mockSession.authState.accessToken);

      expect(registeredUserResult.isOk()).toBe(true);
      const registeredUser = registeredUserResult.unwrap();

      expect(registeredUser).toMatchObject({
        uuName: 'Test User',
        networkName: 'mock-active-directory-id',
        role: 'employee',
      });
      expect(registeredUser.id).toBeDefined();
      expect(registeredUser.userCreated).toBe('mock-active-directory-id');
      expect(registeredUser.dateCreated).toBeDefined();
    });

    it('should register a new hiring manager', async () => {
      const newUserData = {
        role: 'hiring-manager',
        languageId: 1,
      };

      const mockSession = {
        authState: {
          accessTokenClaims: {
            roles: [],
            sub: 'test-manager-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-manager-123',
            oid: 'test-manager-123',
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

      const registeredUserResult = await userService.registerCurrentUser(newUserData, mockSession.authState.accessToken);

      expect(registeredUserResult.isOk()).toBe(true);
      const registeredUser = registeredUserResult.unwrap();

      expect(registeredUser).toMatchObject({
        uuName: 'Test User',
        networkName: 'mock-active-directory-id',
        role: 'employee',
      });
    });
  });
});
