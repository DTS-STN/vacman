import { describe, it, expect } from 'vitest';

import type { UserCreate, UserUpdate } from '~/.server/domain/models';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { PREFERRED_LANGUAGE_ENGLISH, USER_TYPE_HR_ADVISOR } from '~/domain/constants';
import { ErrorCodes } from '~/errors/error-codes';

describe('getMockUserService', () => {
  const service = getMockUserService();
  const mockAccessToken = 'mock-access-token';

  describe('getUsers', () => {
    it('should return paginated users with default pagination', async () => {
      const params = {};
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const response = result.unwrap();

      expect(response.content).toHaveLength(10); // Should return all 10 mock users
      expect(response.page).toEqual({
        size: 10,
        totalElements: 10,
        totalPages: 1,
        number: 0,
      });

      // Verify first user has new structure
      const firstUser = response.content[0];
      expect(firstUser).toEqual({
        id: 1,
        businessEmailAddress: 'john.doe@canada.ca',
        businessPhoneNumber: '+1-613-555-0102',
        firstName: 'John',
        initial: 'M',
        lastName: 'Doe',
        middleName: 'Michael',
        microsoftEntraId: '11111111-1111-1111-1111-111111111111',
        personalRecordIdentifier: '987654321',
        language: PREFERRED_LANGUAGE_ENGLISH,
        userType: USER_TYPE_HR_ADVISOR,
        createdBy: 'system',
        createdDate: '2024-01-01T00:00:00Z',
        lastModifiedBy: 'system',
        lastModifiedDate: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle pagination correctly', async () => {
      const params = { page: 1, size: 3 };
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const response = result.unwrap();

      expect(response.content).toHaveLength(3);
      expect(response.page).toEqual({
        size: 3,
        totalElements: 10,
        totalPages: 4,
        number: 1,
      });

      // Should return users 4, 5, 6 (zero-indexed page 1)
      expect(response.content[0]?.id).toBe(4);
      expect(response.content[1]?.id).toBe(5);
      expect(response.content[2]?.id).toBe(6);
    });

    it('should filter by user type', async () => {
      const params = { 'user-type': 'HRA' };
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const response = result.unwrap();

      // Should find 2 HR advisors (John and Alex)
      expect(response.content).toHaveLength(2);
      expect(response.content.every((user) => user.userType?.code === USER_TYPE_HR_ADVISOR.code)).toBe(true);
      expect(response.page.totalElements).toBe(2);
    });

    it('should return empty results for non-existent user type', async () => {
      const params = { 'user-type': 'NON_EXISTENT' };
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const response = result.unwrap();

      expect(response.content).toHaveLength(0);
      expect(response.page.totalElements).toBe(0);
    });
  });

  describe('getUserById', () => {
    it('should return a user when given a valid ID', async () => {
      const result = await service.getUserById(1, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const user = result.unwrap();

      expect(user.id).toBe(1);
      expect(user.businessEmailAddress).toBe('john.doe@canada.ca');
      expect(user.userType?.code).toBe(USER_TYPE_HR_ADVISOR.code);
    });

    it('should return an error when user is not found', async () => {
      const result = await service.getUserById(999, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();

      expect(error.message).toBe('User not found');
      expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
    });
  });

  describe('findUserById', () => {
    it('should return Some(user) when user exists', async () => {
      const result = await service.findUserById(2, mockAccessToken);

      expect(result.isSome()).toBe(true);
      const user = result.unwrap();

      expect(user.id).toBe(2);
      expect(user.firstName).toBe('Jane');
    });

    it('should return None when user does not exist', async () => {
      const result = await service.findUserById(999, mockAccessToken);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the first HR advisor as current user', async () => {
      const result = await service.getCurrentUser(mockAccessToken);

      expect(result.isSome()).toBe(true);
      const user = result.unwrap();

      expect(user.userType?.code).toBe(USER_TYPE_HR_ADVISOR.code);
      expect(user.firstName).toBe('John');
    });
  });

  describe('updateUserById', () => {
    it('should update an existing user', async () => {
      const updateData: UserUpdate = {
        firstName: 'Updated Jane',
        businessPhone: '+1-613-555-9999',
        languageId: PREFERRED_LANGUAGE_ENGLISH.id,
      };

      const result = await service.updateUserById(1, updateData, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const updatedUser = result.unwrap();

      expect(updatedUser.id).toBe(1);
      expect(updatedUser.firstName).toBe('Updated Jane');
      expect(updatedUser.businessPhoneNumber).toBe('+1-613-555-9999');
      expect(updatedUser.lastName).toBe('Doe'); // Should preserve unchanged fields

      // Verify lastModifiedDate was updated
      expect(updatedUser.lastModifiedDate).toBeDefined();
      if (updatedUser.lastModifiedDate) {
        expect(new Date(updatedUser.lastModifiedDate).getTime()).toBeGreaterThan(new Date('2024-01-01T00:00:00Z').getTime());
      }
    });

    it('should return an error when user is not found', async () => {
      const updateData: UserUpdate = { firstName: 'Test', languageId: PREFERRED_LANGUAGE_ENGLISH.id };
      const result = await service.updateUserById(999, updateData, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();

      expect(error.message).toBe('User not found');
      expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
    });
  });

  describe('registerCurrentUser', () => {
    it('should create a new user', async () => {
      const userData: UserCreate = {
        languageId: 2, // French
      };

      const result = await service.registerCurrentUser(userData, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const newUser = result.unwrap();

      expect(newUser.id).toBeGreaterThan(10); // Should be a new ID
      expect(newUser.language.id).toBe(2);
      expect(newUser.language.code).toBe('FR');
      expect(newUser.userType?.code).toBe('EMPLOYEE');
      expect(newUser.businessEmailAddress).toContain('@canada.ca');

      // Verify audit fields
      expect(newUser.createdBy).toBe('system');
      expect(newUser.lastModifiedBy).toBe('system');
      expect(newUser.createdDate).toBeDefined();
      if (newUser.createdDate) {
        expect(new Date(newUser.createdDate).getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
      }
    });

    it('should create user with English language by default', async () => {
      const userData: UserCreate = {
        languageId: 1, // English
      };

      const result = await service.registerCurrentUser(userData, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const newUser = result.unwrap();

      expect(newUser.language.code).toBe('EN');
      expect(newUser.language.nameEn).toBe('English');
    });
  });
});
