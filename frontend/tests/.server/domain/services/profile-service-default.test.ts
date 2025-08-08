import { Ok, Err } from 'oxide.ts';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the entire apiClient module
vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getDefaultProfileService', () => {
  const profileService = getDefaultProfileService();
  const mockActiveDirectoryId = 'test-ad-id-123';
  const mockAccessToken = 'test-ad-id-123';

  const mockProfile: Profile = {
    profileId: 1,
    userId: 123,
    userIdReviewedBy: 456,
    userIdApprovedBy: 789,
    priorityLevelId: 1,
    profileStatusId: 1,
    privacyConsentInd: true,
    userCreated: 'test-user',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'test-user',
    dateUpdated: '2024-01-01T00:00:00Z',
    personalInformation: {
      personalRecordIdentifier: '123456789',
      preferredLanguageId: undefined,
      workEmail: 'firstname.lastname@email.ca',
      personalEmail: 'john.doe@example.com',
      workPhone: undefined,
      personalPhone: '555-0123',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      substantivePosition: undefined,
      branchOrServiceCanadaRegion: undefined,
      directorate: undefined,
      province: undefined,
      cityId: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: [864190000],
      classificationIds: [905190000, 905190001],
      workLocationProvince: 1,
      workLocationCitiesIds: [411290001, 411290002],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190000, 664190001, 664190003],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return a profile when found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.OK,
        json: vi.fn().mockResolvedValueOnce(mockProfile),
      });

      const result = await profileService.getProfile(mockActiveDirectoryId);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(
        `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/by-active-directory-id/${encodeURIComponent(mockActiveDirectoryId)}`,
      );
    });

    it('should return null when profile is not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
      });

      const result = await profileService.getProfile(mockActiveDirectoryId);

      expect(result.isNone()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/by-active-directory-id/${encodeURIComponent(mockActiveDirectoryId)}`,
      );
    });

    it('should throw AppError when server responds with error status', async () => {
      const errorStatus = HttpStatusCodes.INTERNAL_SERVER_ERROR;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(profileService.getProfile(mockActiveDirectoryId)).rejects.toThrow();
    });

    it('should handle URL encoding for special characters in activeDirectoryId', async () => {
      const specialCharId = 'user@domain.com';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.OK,
        json: vi.fn().mockResolvedValueOnce(mockProfile),
      });

      await profileService.getProfile(specialCharId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/by-active-directory-id/${encodeURIComponent(specialCharId)}`,
      );
    });

    it('should throw AppError when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(profileService.getProfile(mockActiveDirectoryId)).rejects.toThrow('Network error');
    });
  });

  describe('registerProfile', () => {
    it('should return an Ok result with the profile on successful API call', async () => {
      // Arrange: Configure the mocked apiClient.post to return a successful `Ok` result
      vi.mocked(apiClient.post).mockResolvedValue(Ok(mockProfile));

      // Act: Call the service method
      const result = await profileService.registerProfile(mockAccessToken);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/profiles/me', 'register a new user profile', {}, mockAccessToken);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(mockProfile);
    });

    it('should return an Err with a specific error code when API call fails', async () => {
      // Arrange: Create a generic error that the apiClient would produce
      const mockApiError = new AppError('The server responded with status 500.', ErrorCodes.VACMAN_API_ERROR, {
        httpStatusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      });
      // Configure the mocked apiClient.post to return a failure `Err` result
      vi.mocked(apiClient.post).mockResolvedValue(Err(mockApiError));

      // Act: Call the service method
      const result = await profileService.registerProfile(mockAccessToken);

      // Assert
      expect(result.isErr()).toBe(true);

      const finalError = result.unwrapErr();
      expect(finalError.errorCode).toBe(ErrorCodes.PROFILE_CREATE_FAILED);
      expect(finalError.message).toContain('Failed to register profile. Reason:');
      expect(finalError.httpStatusCode).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
