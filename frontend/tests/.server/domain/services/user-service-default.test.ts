import { Ok, Err } from 'oxide.ts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { User, UserCreate, UserUpdate, PagedUserResponse, UserQueryParams } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
// Import after mocking
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { PREFERRED_LANGUAGE_ENGLISH, USER_TYPE_EMPLOYEE, USER_TYPE_HR_ADVISOR } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock the API client module
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

describe('getDefaultUserService', () => {
  const service = getDefaultUserService();
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUsers', () => {
    const mockUserResponse: PagedUserResponse = {
      content: [
        {
          id: 1,
          businessEmailAddress: 'jane.doe@canada.ca',
          businessPhoneNumber: '+1-613-555-0101',
          firstName: 'Jane',
          initial: 'D',
          lastName: 'Doe',
          middleName: undefined,
          microsoftEntraId: '00000000-0000-0000-0000-000000000000',
          personalRecordIdentifier: '123456789',
          language: PREFERRED_LANGUAGE_ENGLISH,
          userType: USER_TYPE_HR_ADVISOR,
          createdBy: 'system',
          createdDate: '2024-01-01T00:00:00Z',
          lastModifiedBy: 'system',
          lastModifiedDate: '2024-01-01T00:00:00Z',
        },
      ],
      page: {
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0,
      },
    };

    it('should return paginated users successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce(Ok(mockUserResponse));

      const params: UserQueryParams = { page: 0, size: 10 };
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const response = result.unwrap();

      expect(response).toEqual(mockUserResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users?page=0&size=10', 'retrieve paginated users', mockAccessToken);
    });

    it('should include user-type filter in query', async () => {
      mockApiClient.get.mockResolvedValueOnce(Ok(mockUserResponse));

      const params: UserQueryParams = { 'user-type': 'HRA', 'page': 0, 'size': 10 };
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isOk()).toBe(true);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/users?page=0&size=10&user-type=HRA',
        'retrieve paginated users',
        mockAccessToken,
      );
    });

    it('should handle API errors', async () => {
      const apiError = new AppError('API Error', ErrorCodes.VACMAN_API_ERROR);
      mockApiClient.get.mockResolvedValueOnce(Err(apiError));

      const params: UserQueryParams = {};
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error.message).toBe('API Error');
      expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
    });

    it('should handle network exceptions', async () => {
      // Mock the API client to return an error rather than throw
      const networkError = new AppError('Network error occurred', ErrorCodes.VACMAN_API_ERROR);
      mockApiClient.get.mockResolvedValueOnce(Err(networkError));

      const params: UserQueryParams = {};
      const result = await service.getUsers(params, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
    });
  });

  describe('getUserById', () => {
    const mockUser: User = {
      id: 1,
      businessEmailAddress: 'jane.doe@canada.ca',
      businessPhoneNumber: '+1-613-555-0101',
      firstName: 'Jane',
      initial: 'D',
      lastName: 'Doe',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000000',
      personalRecordIdentifier: '123456789',
      language: PREFERRED_LANGUAGE_ENGLISH,
      userType: USER_TYPE_HR_ADVISOR,
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-01-01T00:00:00Z',
    };

    it('should return user by ID successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce(Ok(mockUser));

      const result = await service.getUserById(1, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const user = result.unwrap();

      expect(user).toEqual(mockUser);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1', 'retrieve user with ID 1', mockAccessToken);
    });

    it('should handle user not found', async () => {
      const notFoundError = new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND);
      mockApiClient.get.mockResolvedValueOnce(Err(notFoundError));

      const result = await service.getUserById(999, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error.message).toBe('User not found');
      expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
    });
  });

  describe('findUserById', () => {
    const mockUser: User = {
      id: 1,
      businessEmailAddress: 'jane.doe@canada.ca',
      businessPhoneNumber: '+1-613-555-0101',
      firstName: 'Jane',
      initial: 'D',
      lastName: 'Doe',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000000',
      personalRecordIdentifier: '123456789',
      language: PREFERRED_LANGUAGE_ENGLISH,
      userType: USER_TYPE_HR_ADVISOR,
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-01-01T00:00:00Z',
    };

    it('should return Some(user) when user exists', async () => {
      mockApiClient.get.mockResolvedValueOnce(Ok(mockUser));

      const result = await service.findUserById(1, mockAccessToken);

      expect(result.isSome()).toBe(true);
      const user = result.unwrap();
      expect(user).toEqual(mockUser);
    });

    it('should return None when user does not exist', async () => {
      const notFoundError = new AppError('User not found', ErrorCodes.PROFILE_NOT_FOUND);
      mockApiClient.get.mockResolvedValueOnce(Err(notFoundError));

      const result = await service.findUserById(999, mockAccessToken);

      expect(result.isNone()).toBe(true);
    });

    it('should return None on other API errors', async () => {
      const apiError = new AppError('Server error', ErrorCodes.VACMAN_API_ERROR);
      mockApiClient.get.mockResolvedValueOnce(Err(apiError));

      const result = await service.findUserById(1, mockAccessToken);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    const mockUser: User = {
      id: 1,
      businessEmailAddress: 'current.user@canada.ca',
      businessPhoneNumber: '+1-613-555-0101',
      firstName: 'Current',
      initial: 'U',
      lastName: 'User',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000000',
      personalRecordIdentifier: '123456789',
      language: PREFERRED_LANGUAGE_ENGLISH,
      userType: USER_TYPE_EMPLOYEE,
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-01-01T00:00:00Z',
    };

    it('should return Some(user) for current user', async () => {
      mockApiClient.get.mockResolvedValueOnce(Ok(mockUser));

      const result = await service.getCurrentUser(mockAccessToken);

      expect(result.isSome()).toBe(true);
      const user = result.unwrap();
      expect(user).toEqual(mockUser);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me', 'get current user', mockAccessToken);
    });

    it('should return None when current user not found', async () => {
      const notFoundError = new AppError('User not found', ErrorCodes.VACMAN_API_ERROR, { httpStatusCode: 404 });
      mockApiClient.get.mockResolvedValueOnce(Err(notFoundError));

      const result = await service.getCurrentUser(mockAccessToken);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('updateUserById', () => {
    const mockUpdatedUser: User = {
      id: 1,
      businessEmailAddress: 'updated.jane@canada.ca',
      businessPhoneNumber: '+1-613-555-9999',
      firstName: 'Updated Jane',
      initial: 'D',
      lastName: 'Doe',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000000',
      personalRecordIdentifier: '123456789',
      language: PREFERRED_LANGUAGE_ENGLISH,
      userType: USER_TYPE_HR_ADVISOR,
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-08-15T10:00:00Z',
    };

    it('should update user successfully', async () => {
      mockApiClient.put.mockResolvedValueOnce(Ok(mockUpdatedUser));

      const updateData: UserUpdate = {
        firstName: 'Updated Jane',
        businessPhone: '+1-613-555-9999',
        languageId: PREFERRED_LANGUAGE_ENGLISH.id,
      };

      const result = await service.updateUserById(1, updateData, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const user = result.unwrap();

      expect(user).toEqual(mockUpdatedUser);
      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', 'update user with ID 1', updateData, mockAccessToken);
    });

    it('should handle update errors', async () => {
      const updateError = new AppError('Update failed', ErrorCodes.PROFILE_UPDATE_FAILED);
      mockApiClient.put.mockResolvedValueOnce(Err(updateError));

      const updateData: UserUpdate = { firstName: 'Test', languageId: PREFERRED_LANGUAGE_ENGLISH.id };
      const result = await service.updateUserById(1, updateData, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error.message).toBe('Update failed');
      expect(error.errorCode).toBe(ErrorCodes.PROFILE_UPDATE_FAILED);
    });
  });

  describe('registerCurrentUser', () => {
    const mockCreatedUser: User = {
      id: 11,
      businessEmailAddress: 'new.user@canada.ca',
      businessPhoneNumber: '+1-613-555-0000',
      firstName: 'New',
      initial: 'U',
      lastName: 'User',
      middleName: undefined,
      microsoftEntraId: '12345678-1234-1234-1234-123456789012',
      personalRecordIdentifier: '987654321',
      language: PREFERRED_LANGUAGE_ENGLISH,
      userType: USER_TYPE_EMPLOYEE,
      createdBy: 'system',
      createdDate: '2024-08-15T10:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-08-15T10:00:00Z',
    };

    it('should register new user successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce(Ok(mockCreatedUser));

      const userData: UserCreate = {
        languageId: PREFERRED_LANGUAGE_ENGLISH.id,
      };

      const result = await service.registerCurrentUser(userData, mockAccessToken);

      expect(result.isOk()).toBe(true);
      const user = result.unwrap();

      expect(user).toEqual(mockCreatedUser);
      expect(mockApiClient.post).toHaveBeenCalledWith('/users/me', 'register current user', userData, mockAccessToken);
    });

    it('should handle registration errors', async () => {
      const registrationError = new AppError('Registration failed', ErrorCodes.PROFILE_CREATE_FAILED);
      mockApiClient.post.mockResolvedValueOnce(Err(registrationError));

      const userData: UserCreate = { languageId: PREFERRED_LANGUAGE_ENGLISH.id };
      const result = await service.registerCurrentUser(userData, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error.message).toBe('Failed to register user. Reason: Registration failed');
      expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
    });

    it('should handle network exceptions during registration', async () => {
      // Mock the API client to return an error rather than throw
      const networkError = new AppError('Network error occurred', ErrorCodes.VACMAN_API_ERROR);
      mockApiClient.post.mockResolvedValueOnce(Err(networkError));

      const userData: UserCreate = { languageId: PREFERRED_LANGUAGE_ENGLISH.id };
      const result = await service.registerCurrentUser(userData, mockAccessToken);

      expect(result.isErr()).toBe(true);
      const error = result.unwrapErr();
      expect(error.message).toBe('Failed to register user. Reason: Network error occurred');
      expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
    });
  });
});
