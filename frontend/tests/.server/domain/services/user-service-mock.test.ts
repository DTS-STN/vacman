import { isValid, parseISO } from 'date-fns';
import { describe, it, expect } from 'vitest';

import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { ErrorCodes } from '~/errors/error-codes';

describe('getMockUserService', () => {
  const service = getMockUserService();

  describe('getUserById', () => {
    it('should return a user when given a valid ID', async () => {
      const user = await service.getUserById(1);

      expect(user).toEqual({
        id: 1,
        name: 'John Doe',
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

  describe('registerUser', () => {
    it('should create a new user with generated metadata', async () => {
      const userData = { name: 'Test User' };
      const createdUser = await service.registerUser(userData);

      expect(createdUser.id).toBeDefined();

      // Check that dates are ISO strings (exact time will vary)
      expect(isValid(parseISO(createdUser.createdBy)));
      expect(isValid(parseISO(createdUser.lastModifiedBy)));
    });
  });
});
