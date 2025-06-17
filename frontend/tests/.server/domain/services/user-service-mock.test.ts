import { isValid, parseISO } from 'date-fns';
import { describe, it, expect } from 'vitest';

import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { ErrorCodes } from '~/errors/error-codes';

describe('getMockUserService', () => {
  const service = getMockUserService();

  describe('getUserById', () => {
    it('should return a user when given a valid ID', async () => {
      const user = await service.getUserById(1);

      expect(user).toEqual({
        id: 1,
        name: 'Jane Doe',
        activeDirectoryId: '00000000-0000-0000-0000-000000000001',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });
    });

    it('should throw an error when user is not found', async () => {
      await expect(service.getUserById(999)).rejects.toMatchObject({
        msg: "User with ID '999' not found.",
        errorCode: ErrorCodes.VACMAN_API_ERROR,
        httpStatusCode: 500,
        correlationId: expect.any(String),
      });
    });
  });

  describe('getUserByActiveDirectoryId', () => {
    it('should return a user when given a valid Active Directory ID', async () => {
      const user = await service.getUserByActiveDirectoryId('11111111-1111-1111-1111-111111111111');

      expect(user).toEqual({
        id: 2,
        name: 'John Doe',
        activeDirectoryId: '11111111-1111-1111-1111-111111111111',
        role: 'employee',
        privacyConsentAccepted: true,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });
    });

    it('should return null when user is not found', async () => {
      const user = await service.getUserByActiveDirectoryId('nonexistent-id');
      expect(user).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('should create a new user with generated metadata', async () => {
      const userData = {
        name: 'Test User',
        activeDirectoryId: 'test-user-123',
        role: 'employee',
        privacyConsentAccepted: true,
      };

      // Create a mock session for testing
      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: 'test-user-123',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'test-user-123',
            name: 'Test User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as AuthenticatedSession;

      const createdUser = await service.registerUser(userData, mockSession);

      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe('Test User');
      expect(createdUser.activeDirectoryId).toBe('test-user-123');
      expect(createdUser.role).toBe('employee');
      expect(createdUser.privacyConsentAccepted).toBe(true);

      // Check that dates are ISO strings (exact time will vary)
      expect(isValid(parseISO(createdUser.createdDate)));
      expect(isValid(parseISO(createdUser.lastModifiedDate)));
    });
  });

  describe('updateUserRole', () => {
    it('should update an existing user role by Active Directory ID', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';
      const newRole = 'hiring-manager';

      // Create a mock session for testing
      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            name: 'John Doe',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as AuthenticatedSession;

      const updatedUser = await service.updateUserRole(activeDirectoryId, newRole, mockSession);

      expect(updatedUser.id).toBe(2);
      expect(updatedUser.name).toBe('John Doe');
      expect(updatedUser.activeDirectoryId).toBe(activeDirectoryId);
      expect(updatedUser.role).toBe(newRole);
      expect(updatedUser.privacyConsentAccepted).toBe(true);

      // Check that lastModifiedDate was updated
      expect(isValid(parseISO(updatedUser.lastModifiedDate))).toBe(true);
      expect(updatedUser.lastModifiedBy).toBe('system');

      // Verify the user was actually updated in the mock data
      const verifyUser = await service.getUserByActiveDirectoryId(activeDirectoryId);
      expect(verifyUser?.role).toBe(newRole);
    });

    it('should throw error when updating role for non-existent user', async () => {
      const activeDirectoryId = 'nonexistent-id';
      const newRole = 'hiring-manager';

      // Create a mock session for testing
      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['admin'],
            sub: 'admin-user',
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: 'admin-user',
            name: 'Admin User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as AuthenticatedSession;

      await expect(service.updateUserRole(activeDirectoryId, newRole, mockSession)).rejects.toMatchObject({
        msg: "User with Active Directory ID 'nonexistent-id' not found.",
        errorCode: ErrorCodes.VACMAN_API_ERROR,
        httpStatusCode: 500,
        correlationId: expect.any(String),
      });
    });

    it('should update user role from employee to hiring-manager', async () => {
      const activeDirectoryId = '22222222-2222-2222-2222-222222222222';
      const newRole = 'hiring-manager';

      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            name: 'Jane Smith',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as AuthenticatedSession;

      // Verify initial state
      const initialUser = await service.getUserByActiveDirectoryId(activeDirectoryId);
      expect(initialUser?.role).toBe('employee');

      // Update role
      const updatedUser = await service.updateUserRole(activeDirectoryId, newRole, mockSession);

      expect(updatedUser.id).toBe(3);
      expect(updatedUser.name).toBe('Jane Smith');
      expect(updatedUser.role).toBe(newRole);
      expect(updatedUser.privacyConsentAccepted).toBe(true);
    });

    it('should update user role from hiring-manager to employee', async () => {
      const activeDirectoryId = '33333333-3333-3333-3333-333333333333';
      const newRole = 'employee';

      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['hiring-manager'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            name: 'Michel Tremblay',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as AuthenticatedSession;

      // Verify initial state
      const initialUser = await service.getUserByActiveDirectoryId(activeDirectoryId);
      expect(initialUser?.role).toBe('hiring-manager');

      // Update role
      const updatedUser = await service.updateUserRole(activeDirectoryId, newRole, mockSession);

      expect(updatedUser.id).toBe(4);
      expect(updatedUser.name).toBe('Michel Tremblay');
      expect(updatedUser.role).toBe(newRole);
      expect(updatedUser.privacyConsentAccepted).toBe(true);
    });
  });
});
