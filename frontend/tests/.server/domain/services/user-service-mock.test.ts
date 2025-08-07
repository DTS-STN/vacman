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
        uuName: 'Jane Doe',
        networkName: '00000000-0000-0000-0000-000000000000',
        role: 'hr-advisor',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
        firstName: 'Jane',
        middleName: undefined,
        lastName: 'Doe',
        initials: 'J.D.',
        personalRecordIdentifier: '123456789',
        businessPhone: '+1-613-555-0101',
        businessEmail: 'jane.doe@canada.ca',
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
        uuName: 'John Doe',
        networkName: '11111111-1111-1111-1111-111111111111',
        role: 'employee',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: 'system',
        dateUpdated: '2024-01-01T00:00:00Z',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        initials: 'J.M.D.',
        personalRecordIdentifier: '987654321',
        businessPhone: '+1-613-555-0102',
        businessEmail: 'john.doe@canada.ca',
      });
    });

    it('should return null when user is not found', async () => {
      const user = await service.getUserByActiveDirectoryId('nonexistent-id');
      expect(user).toBeNull();
    });
  });

  describe('registerCurrentUser', () => {
    it('should create a new user with generated metadata', async () => {
      const userData = {
        role: 'employee',
        languageId: 1,
      };

      // Create a mock session for testing
      const mockSession = {
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
            oid: 'test-user-123',
            name: 'Test User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const createdUser = await service.registerCurrentUser(
        userData,
        mockSession.authState.accessToken,
        mockSession.authState.idTokenClaims,
      );

      expect(createdUser.id).toBeDefined();
      expect(createdUser.uuName).toBe('Test User');
      expect(createdUser.networkName).toBe('test-user-123');
      expect(createdUser.role).toBe('employee');

      // Check that dates are ISO strings (exact time will vary)
      expect(createdUser.dateCreated).toBeDefined();
      expect(createdUser.dateUpdated).toBeDefined();
      if (createdUser.dateCreated) {
        expect(isValid(parseISO(createdUser.dateCreated))).toBe(true);
      }
      if (createdUser.dateUpdated) {
        expect(isValid(parseISO(createdUser.dateUpdated))).toBe(true);
      }
    });
  });
});
