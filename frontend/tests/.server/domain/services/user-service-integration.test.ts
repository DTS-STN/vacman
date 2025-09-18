/**
 * Integration tests for user service functionality including registration and user management.
 */
import { Ok, Err } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { UserCreate, UserUpdate } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
// Import after mocking
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock the API client for default service tests
vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Cast to access mocked methods
const mockApiClient = vi.mocked(apiClient);

describe('User Service Integration', () => {
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mock User Service Integration', () => {
    const userService = getMockUserService();

    describe('Complete user lifecycle', () => {
      it('should register, retrieve, and update a user', async () => {
        // 1. Register a new user
        const newUserData: UserCreate = {
          languageId: 1, // English
        };

        const registrationResult = await userService.registerCurrentUser(newUserData, mockAccessToken);
        expect(registrationResult.isOk()).toBe(true);

        const newUser = registrationResult.unwrap();
        expect(newUser.id).toBeGreaterThan(10); // Should be a new ID
        expect(newUser.language.code).toBe('EN');
        expect(newUser.userType?.code).toBe('EMPLOYEE');

        // 2. Retrieve the newly created user
        const getUserResult = await userService.getUserById(newUser.id, mockAccessToken);
        expect(getUserResult.isOk()).toBe(true);

        const retrievedUser = getUserResult.unwrap();
        expect(retrievedUser.id).toBe(newUser.id);
        expect(retrievedUser.businessEmailAddress).toBe(newUser.businessEmailAddress);

        // 3. Update the user
        const updateData: UserUpdate = {
          firstName: 'Updated First Name',
          lastName: 'Updated Last Name',
          languageId: 1,
        };

        const updateResult = await userService.updateUserById(newUser.id, updateData, mockAccessToken);
        expect(updateResult.isOk()).toBe(true);

        const updatedUser = updateResult.unwrap();
        expect(updatedUser.firstName).toBe('Updated First Name');
        expect(updatedUser.lastName).toBe('Updated Last Name');
        expect(updatedUser.id).toBe(newUser.id); // ID should remain the same
      });

      it('should handle user filtering by user type', async () => {
        // Get all users
        const allUsersResult = await userService.getUsers({}, mockAccessToken);
        expect(allUsersResult.isOk()).toBe(true);
        const allUsersResponse = allUsersResult.unwrap();
        const totalUsers = allUsersResponse.content.length;

        // Filter by HRA user type
        const hrAdvisorResult = await userService.getUsers({ userType: 'HRA' }, mockAccessToken);
        expect(hrAdvisorResult.isOk()).toBe(true);
        const hrAdvisorResponse = hrAdvisorResult.unwrap();

        expect(hrAdvisorResponse.content.length).toBeLessThan(totalUsers);
        expect(hrAdvisorResponse.content.every((user) => user.userType?.code === 'HRA')).toBe(true);

        // Filter by EMPLOYEE user type
        const employeeResult = await userService.getUsers({ userType: 'EMPLOYEE' }, mockAccessToken);
        expect(employeeResult.isOk()).toBe(true);
        const employeeResponse = employeeResult.unwrap();

        expect(employeeResponse.content.every((user) => user.userType?.code === 'EMPLOYEE')).toBe(true);
      });

      it('should handle pagination correctly', async () => {
        // Test first page
        const firstPageResult = await userService.getUsers({ page: 0, size: 3 }, mockAccessToken);
        expect(firstPageResult.isOk()).toBe(true);
        const firstPage = firstPageResult.unwrap();

        expect(firstPage.content).toHaveLength(3);
        expect(firstPage.page.number).toBe(0);
        expect(firstPage.page.size).toBe(3);

        // Test second page
        const secondPageResult = await userService.getUsers({ page: 1, size: 3 }, mockAccessToken);
        expect(secondPageResult.isOk()).toBe(true);
        const secondPage = secondPageResult.unwrap();

        expect(secondPage.content).toHaveLength(3);
        expect(secondPage.page.number).toBe(1);

        // Ensure different users on different pages
        const firstPageIds = firstPage.content.map((u) => u.id);
        const secondPageIds = secondPage.content.map((u) => u.id);
        expect(firstPageIds).not.toEqual(secondPageIds);
      });
    });

    describe('Error handling scenarios', () => {
      it('should handle non-existent user operations gracefully', async () => {
        const nonExistentId = 999999;

        // Test getUserById with non-existent ID
        const getUserResult = await userService.getUserById(nonExistentId, mockAccessToken);
        expect(getUserResult.isErr()).toBe(true);
        expect(getUserResult.unwrapErr().errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);

        // Test findUserById with non-existent ID
        const findUserResult = await userService.findUserById(nonExistentId, mockAccessToken);
        expect(findUserResult.isNone()).toBe(true);

        // Test updateUserById with non-existent ID
        const updateResult = await userService.updateUserById(
          nonExistentId,
          { firstName: 'Test', languageId: 1 },
          mockAccessToken,
        );
        expect(updateResult.isErr()).toBe(true);
        expect(updateResult.unwrapErr().errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
      });
    });
  });

  describe('Default User Service Integration', () => {
    const userService = getDefaultUserService();

    describe('API integration patterns', () => {
      it('should demonstrate successful API workflow', async () => {
        // Mock successful API responses
        const mockUser = {
          id: 1,
          businessEmailAddress: 'test@canada.ca',
          businessPhoneNumber: '+1-613-555-0101',
          firstName: 'Test',
          initial: 'T',
          lastName: 'User',
          middleName: undefined,
          microsoftEntraId: '12345678-1234-1234-1234-123456789012',
          personalRecordIdentifier: '123456789',
          language: {
            id: 1,
            code: 'EN',
            nameEn: 'English',
            nameFr: 'Anglais',
          },
          userType: {
            id: 1,
            code: 'EMPLOYEE',
            nameEn: 'Employee',
            nameFr: 'Employé',
          },
          createdBy: 'system',
          createdDate: '2024-01-01T00:00:00Z',
          lastModifiedBy: 'system',
          lastModifiedDate: '2024-01-01T00:00:00Z',
        };

        const mockPagedResponse = {
          content: [mockUser],
          page: {
            size: 10,
            totalElements: 1,
            totalPages: 1,
            number: 0,
          },
        };

        // Mock getUsers
        mockApiClient.get.mockResolvedValueOnce(Ok(mockPagedResponse));
        const getUsersResult = await userService.getUsers({}, mockAccessToken);
        expect(getUsersResult.isOk()).toBe(true);

        // Mock getUserById
        mockApiClient.get.mockResolvedValueOnce(Ok(mockUser));
        const getUserResult = await userService.getUserById(1, mockAccessToken);
        expect(getUserResult.isOk()).toBe(true);

        // Mock updateUserById
        const updatedUser = { ...mockUser, firstName: 'Updated' };
        mockApiClient.put.mockResolvedValueOnce(Ok(updatedUser));
        const updateResult = await userService.updateUserById(1, { firstName: 'Updated', languageId: 1 }, mockAccessToken);
        expect(updateResult.isOk()).toBe(true);

        // Verify API calls were made correctly
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
        expect(mockApiClient.put).toHaveBeenCalledTimes(1);
      });

      it('should handle API error scenarios', async () => {
        // Mock API errors
        const apiError = new AppError('API Error', ErrorCodes.VACMAN_API_ERROR);

        mockApiClient.get.mockResolvedValueOnce(Err(apiError));
        const getUsersResult = await userService.getUsers({}, mockAccessToken);
        expect(getUsersResult.isErr()).toBe(true);
        expect(getUsersResult.unwrapErr().errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);

        // Mock network errors
        const networkError = new AppError('Network error occurred', ErrorCodes.VACMAN_API_ERROR);
        mockApiClient.get.mockResolvedValueOnce(Err(networkError));
        const getUserResult = await userService.getUserById(1, mockAccessToken);
        expect(getUserResult.isErr()).toBe(true);
      });
    });
  });

  describe('Service comparison and consistency', () => {
    it('should have consistent interfaces between mock and default services', () => {
      const mockService = getMockUserService();
      const defaultService = getDefaultUserService();

      // Both services should have the same method signatures
      expect(typeof mockService.getUsers).toBe('function');
      expect(typeof defaultService.getUsers).toBe('function');

      expect(typeof mockService.getUserById).toBe('function');
      expect(typeof defaultService.getUserById).toBe('function');

      expect(typeof mockService.findUserById).toBe('function');
      expect(typeof defaultService.findUserById).toBe('function');

      expect(typeof mockService.getCurrentUser).toBe('function');
      expect(typeof defaultService.getCurrentUser).toBe('function');

      expect(typeof mockService.updateUserById).toBe('function');
      expect(typeof defaultService.updateUserById).toBe('function');

      expect(typeof mockService.registerCurrentUser).toBe('function');
      expect(typeof defaultService.registerCurrentUser).toBe('function');
    });

    it('should return consistent data structures from mock service', async () => {
      const mockService = getMockUserService();

      // Test that mock service returns data in expected format
      const getUsersResult = await mockService.getUsers({}, mockAccessToken);
      expect(getUsersResult.isOk()).toBe(true);

      const response = getUsersResult.unwrap();
      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('page');
      expect(Array.isArray(response.content)).toBe(true);

      if (response.content.length > 0) {
        const user = response.content[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('businessEmailAddress');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('userType');
        expect(user).toHaveProperty('language');
      }
    });
  });
});
