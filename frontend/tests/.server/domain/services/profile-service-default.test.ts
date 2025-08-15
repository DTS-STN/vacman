import { Ok, Err } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProfilePutModel, ProfileStatusUpdate } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock the API client
vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

const defaultProfileService = getDefaultProfileService();

describe('ProfileServiceDefault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfiles', () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          additionalComment: 'Test comment',
          hasConsentedToPrivacyTerms: true,
          profileUser: { id: 1, firstName: 'John', lastName: 'Doe' },
          profileStatus: { id: 1, code: 'PENDING', nameEn: 'Pending', nameFr: 'En attente' },
        },
      ],
      page: {
        number: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    };

    it('should fetch profiles successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = { page: 1, size: 10 };
      const accessToken = 'valid-token';

      const result = await defaultProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/profiles?page=1&size=10', 'retrieve paginated profiles', accessToken);

      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toHaveLength(1);
        expect(response.page.number).toBe(1);
        expect(response.page.size).toBe(10);
      }
    });

    it('should include query parameters when provided', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = {
        'page': 2,
        'size': 20,
        'active': true,
        'hr-advisor': '5',
      };
      const accessToken = 'valid-token';

      await defaultProfileService.getProfiles(params, accessToken);

      expect(mockGet).toHaveBeenCalledWith(
        '/profiles?page=2&size=20&active=true&hr-advisor=5',
        'retrieve paginated profiles',
        accessToken,
      );
    });

    it('should propagate HTTP client errors', async () => {
      const httpError = Err(new AppError('HTTP request failed', ErrorCodes.VACMAN_API_ERROR));
      mockGet.mockResolvedValue(httpError);

      const params = { page: 1, size: 10 };
      const accessToken = 'valid-token';

      const result = await defaultProfileService.getProfiles(params, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
      }
    });
  });

  describe('getCurrentUserProfiles', () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          profileUser: { id: 1, firstName: 'Current', lastName: 'User' },
          profileStatus: { id: 2, code: 'APPROVED', nameEn: 'Approved', nameFr: 'Approuvé' },
        },
      ],
    };

    it('should fetch current user profiles successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = { active: true };
      const accessToken = 'user-token';

      const result = await defaultProfileService.getCurrentUserProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/profiles/me?active=true', 'retrieve current user profiles', accessToken);

      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toHaveLength(1);
        expect(response.content[0]?.profileUser?.firstName).toBe('Current');
      }
    });

    it('should handle empty query parameters', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = {};
      const accessToken = 'user-token';

      await defaultProfileService.getCurrentUserProfiles(params, accessToken);

      expect(mockGet).toHaveBeenCalledWith('/profiles/me', 'retrieve current user profiles', accessToken);
    });

    it('should propagate HTTP client errors', async () => {
      const httpError = Err(new AppError('Unauthorized access', ErrorCodes.ACCESS_FORBIDDEN));
      mockGet.mockResolvedValue(httpError);

      const params = { active: true };
      const accessToken = 'invalid-token';

      const result = await defaultProfileService.getCurrentUserProfiles(params, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.ACCESS_FORBIDDEN);
      }
    });
  });

  describe('findCurrentUserProfile', () => {
    const mockResponse = {
      content: [
        {
          id: 1,
          profileUser: { id: 1, firstName: 'Current', lastName: 'User' },
          profileStatus: { id: 2, code: 'APPROVED', nameEn: 'Approved', nameFr: 'Approuvé' },
          personalEmailAddress: 'current.user@example.com',
          personalPhoneNumber: '555-1234',
          isAvailableForReferral: true,
        },
      ],
    };

    it('should fetch current user profile successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = { active: true };
      const accessToken = 'user-token';

      const result = await defaultProfileService.findCurrentUserProfile(params, accessToken);

      expect(mockGet).toHaveBeenCalledWith('/profiles/me?active=true', 'retrieve current user profiles', accessToken);
      expect(result).toEqual(mockResponse.content[0]);
    });

    it('should throw AppError when no profiles are found', async () => {
      const emptyResponse = { content: [] };
      mockGet.mockResolvedValue(Ok(emptyResponse));

      const params = { active: true };
      const accessToken = 'user-token';

      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(AppError);
      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(
        'No active profile found for current user',
      );
    });

    it('should throw AppError when profile data is null/undefined', async () => {
      const invalidResponse = { content: [null] };
      mockGet.mockResolvedValue(Ok(invalidResponse));

      const params = { active: true };
      const accessToken = 'user-token';

      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(AppError);
      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(
        'Profile data is invalid',
      );
    });

    it('should throw the underlying error when getCurrentUserProfiles fails', async () => {
      const httpError = Err(new AppError('Unauthorized access', ErrorCodes.ACCESS_FORBIDDEN));
      mockGet.mockResolvedValue(httpError);

      const params = { active: true };
      const accessToken = 'invalid-token';

      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(AppError);
      await expect(defaultProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow('Unauthorized access');
    });

    it('should handle undefined active parameter', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = {};
      const accessToken = 'user-token';

      await defaultProfileService.findCurrentUserProfile(params, accessToken);

      expect(mockGet).toHaveBeenCalledWith('/profiles/me', 'retrieve current user profiles', accessToken);
    });
  });

  describe('registerProfile', () => {
    const mockProfile = {
      id: 123,
      profileUser: { id: 1, firstName: 'New', lastName: 'User' },
      profileStatus: { id: 2, code: 'INCOMPLETE', nameEn: 'Incomplete', nameFr: 'Incomplet' },
      hasConsentedToPrivacyTerms: false,
      isAvailableForReferral: true,
      createdDate: '2024-01-15T10:30:00Z',
    };

    it('should register a new profile successfully', async () => {
      mockPost.mockResolvedValue(Ok(mockProfile));

      const accessToken = 'valid-token';

      const result = await defaultProfileService.registerProfile(accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockPost).toHaveBeenCalledWith('/profiles/me', 'register new profile', {}, accessToken);

      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(123);
        expect(profile.profileStatus?.code).toBe('INCOMPLETE');
      }
    });

    it('should propagate registration errors', async () => {
      const registrationError = Err(new AppError('Profile creation failed', ErrorCodes.PROFILE_CREATE_FAILED));
      mockPost.mockResolvedValue(registrationError);

      const accessToken = 'valid-token';

      const result = await defaultProfileService.registerProfile(accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_CREATE_FAILED);
      }
    });
  });

  describe('getProfileById', () => {
    const mockProfile = {
      id: 42,
      additionalComment: 'Detailed profile',
      hasConsentedToPrivacyTerms: true,
      hrAdvisorId: 5,
      profileUser: { id: 3, firstName: 'Jane', lastName: 'Smith' },
      profileStatus: { id: 1, code: 'PENDING', nameEn: 'Pending', nameFr: 'En attente' },
    };

    it('should fetch profile by ID successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockProfile));

      const profileId = 42;
      const accessToken = 'valid-token';

      const result = await defaultProfileService.getProfileById(profileId, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(`/profiles/${profileId}`, `retrieve profile with ID ${profileId}`, accessToken);

      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(42);
        expect(profile.hrAdvisorId).toBe(5);
      }
    });

    it('should handle profile not found', async () => {
      const notFoundError = Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND, { httpStatusCode: 404 }));
      mockGet.mockResolvedValue(notFoundError);

      const profileId = 999;
      const accessToken = 'valid-token';

      const result = await defaultProfileService.getProfileById(profileId, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
      }
    });
  });

  describe('updateProfileById', () => {
    const mockUpdatedProfile = {
      id: 42,
      additionalComment: 'Updated comment',
      hasConsentedToPrivacyTerms: true,
      personalEmailAddress: 'updated@example.com',
      lastModifiedDate: '2024-01-15T12:00:00Z',
      lastModifiedBy: 'test-user',
    };

    it('should update profile successfully', async () => {
      mockPut.mockResolvedValue(Ok(mockUpdatedProfile));

      const profileId = 42;
      const updatedProfile: ProfilePutModel = {
        additionalComment: 'Updated comment',
        hasConsentedToPrivacyTerms: true,
        personalEmailAddress: 'updated@example.com',
      };
      const accessToken = 'valid-token';

      const result = await defaultProfileService.updateProfileById(profileId, updatedProfile, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockPut).toHaveBeenCalledWith(
        `/profiles/${profileId}`,
        `update profile with ID ${profileId}`,
        updatedProfile,
        accessToken,
      );

      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(42);
        expect(profile.additionalComment).toBe('Updated comment');
        expect(profile.personalEmailAddress).toBe('updated@example.com');
      }
    });

    it('should handle update errors', async () => {
      const updateError = Err(new AppError('Update failed', ErrorCodes.PROFILE_UPDATE_FAILED));
      mockPut.mockResolvedValue(updateError);

      const profileId = 42;
      const updatedProfile: ProfilePutModel = { additionalComment: 'Updated comment' };
      const accessToken = 'valid-token';

      const result = await defaultProfileService.updateProfileById(profileId, updatedProfile, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_UPDATE_FAILED);
      }
    });
  });

  describe('updateProfileStatus', () => {
    it('should update profile status successfully', async () => {
      mockPut.mockResolvedValue(Ok(undefined));

      const profileId = 42;
      const statusUpdate: ProfileStatusUpdate = {
        id: 3,
        code: 'APPROVED',
        nameEn: 'Approved',
        nameFr: 'Approuvé',
      };
      const accessToken = 'admin-token';

      const result = await defaultProfileService.updateProfileStatus(profileId, statusUpdate, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockPut).toHaveBeenCalledWith(
        `/profiles/${profileId}/status`,
        `update profile status for ID ${profileId}`,
        statusUpdate,
        accessToken,
      );
    });

    it('should handle status update errors', async () => {
      const statusError = Err(new AppError('Status update failed', ErrorCodes.PROFILE_STATUS_UPDATE_FAILED));
      mockPut.mockResolvedValue(statusError);

      const profileId = 42;
      const statusUpdate: ProfileStatusUpdate = {
        id: 3,
        code: 'APPROVED',
        nameEn: 'Approved',
        nameFr: 'Approuvé',
      };
      const accessToken = 'admin-token';

      const result = await defaultProfileService.updateProfileStatus(profileId, statusUpdate, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_STATUS_UPDATE_FAILED);
      }
    });
  });

  describe('findProfileById', () => {
    const mockProfile = {
      id: 42,
      profileUser: { id: 3, firstName: 'Found', lastName: 'User' },
    };

    it('should return Some when profile is found', async () => {
      mockGet.mockResolvedValue(Ok(mockProfile));

      const profileId = 42;
      const accessToken = 'valid-token';

      const result = await defaultProfileService.findProfileById(profileId, accessToken);

      expect(result.isSome()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(`/profiles/${profileId}`, `retrieve profile with ID ${profileId}`, accessToken);

      if (result.isSome()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(42);
      }
    });

    it('should return None when profile is not found', async () => {
      const notFoundError = Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND));
      mockGet.mockResolvedValue(notFoundError);

      const profileId = 999;
      const accessToken = 'valid-token';

      const result = await defaultProfileService.findProfileById(profileId, accessToken);

      expect(result.isNone()).toBe(true);
    });

    it('should return None for other HTTP errors', async () => {
      const httpError = Err(new AppError('Server error', ErrorCodes.VACMAN_API_ERROR));
      mockGet.mockResolvedValue(httpError);

      const profileId = 42;
      const accessToken = 'valid-token';

      const result = await defaultProfileService.findProfileById(profileId, accessToken);

      expect(result.isNone()).toBe(true);
    });
  });

  describe('HTTP client integration', () => {
    it('should use correct API client calls consistently', async () => {
      const mockResponse = { content: [], page: { number: 1, size: 10, totalElements: 0, totalPages: 0 } };
      mockGet.mockResolvedValue(Ok(mockResponse));
      mockPost.mockResolvedValue(Ok({ id: 1 }));
      mockPut.mockResolvedValue(Ok({ id: 1 }));

      const accessToken = 'test-token';

      // Test different endpoints
      await defaultProfileService.getProfiles({ page: 1, size: 10 }, accessToken);
      await defaultProfileService.getCurrentUserProfiles({}, accessToken);
      await defaultProfileService.registerProfile(accessToken);
      await defaultProfileService.getProfileById(1, accessToken);
      await defaultProfileService.updateProfileById(1, { additionalComment: 'test' }, accessToken);
      await defaultProfileService.updateProfileStatus(1, {}, accessToken);
      await defaultProfileService.findProfileById(1, accessToken);

      // Verify all requests used the correct context strings and access tokens
      expect(mockGet).toHaveBeenCalledWith('/profiles?page=1&size=10', 'retrieve paginated profiles', accessToken);
      expect(mockGet).toHaveBeenCalledWith('/profiles/me', 'retrieve current user profiles', accessToken);
      expect(mockPost).toHaveBeenCalledWith('/profiles/me', 'register new profile', {}, accessToken);
      expect(mockGet).toHaveBeenCalledWith('/profiles/1', 'retrieve profile with ID 1', accessToken);
      expect(mockPut).toHaveBeenCalledWith(
        '/profiles/1',
        'update profile with ID 1',
        { additionalComment: 'test' },
        accessToken,
      );
      expect(mockPut).toHaveBeenCalledWith('/profiles/1/status', 'update profile status for ID 1', {}, accessToken);
      expect(mockGet).toHaveBeenCalledWith('/profiles/1', 'retrieve profile with ID 1', accessToken);
    });

    it('should handle network errors gracefully', async () => {
      const apiError = Err(new AppError('Request timeout', ErrorCodes.VACMAN_API_ERROR));
      mockGet.mockResolvedValue(apiError);

      const result = await defaultProfileService.getProfiles({ page: 1, size: 10 }, 'token');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
      }
    });
  });
});
