import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('profile-service-default', () => {
  const profileService = getDefaultProfileService();
  const mockActiveDirectoryId = 'test-ad-id-123';
  const mockSession = {
    oid: 'test-oid-123',
    networkName: 'test-network-name',
    uuName: 'Test User',
    email: 'test@example.com',
    role: 'Employee',
  } as unknown as AuthenticatedSession;

  const mockProfile: Profile = {
    profileId: 1,
    userId: 123,
    userIdReviewedBy: 456,
    userIdApprovedBy: 789,
    educationLevelId: 1,
    wfaStatusId: 1,
    classificationId: 1,
    cityId: 1,
    priorityLevelId: 1,
    workUnitId: 1,
    languageId: 1,
    profileStatusId: 1,
    personalPhoneNumber: '555-0123',
    personalEmailAddress: 'john.doe@example.com',
    privacyConsentInd: true,
    availableForReferralInd: true,
    interestedInAlternationInd: false,
    additionalCommentTxt: 'Test comment',
    userCreated: 'test-user',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'test-user',
    dateUpdated: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.resetAllMocks();
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
    it('should successfully register a new profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.CREATED,
        json: vi.fn().mockResolvedValueOnce(mockProfile),
      });

      const result = await profileService.registerProfile(mockActiveDirectoryId, mockSession);

      expect(result).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeDirectoryId: mockActiveDirectoryId }),
      });
    });

    it('should throw AppError when server responds with error status', async () => {
      const errorStatus = HttpStatusCodes.BAD_REQUEST;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(profileService.registerProfile(mockActiveDirectoryId, mockSession)).rejects.toThrow();
    });

    it('should handle different error status codes', async () => {
      const errorStatus = HttpStatusCodes.UNAUTHORIZED;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(profileService.registerProfile(mockActiveDirectoryId, mockSession)).rejects.toThrow();
    });

    it('should throw AppError when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(profileService.registerProfile(mockActiveDirectoryId, mockSession)).rejects.toThrow('Network error');
    });

    it('should send correct request body with activeDirectoryId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.CREATED,
        json: vi.fn().mockResolvedValueOnce(mockProfile),
      });

      await profileService.registerProfile(mockActiveDirectoryId, mockSession);

      const expectedBody = JSON.stringify({ activeDirectoryId: mockActiveDirectoryId });
      expect(mockFetch).toHaveBeenCalledWith(
        `${serverEnvironment.VACMAN_API_BASE_URI}/profiles`,
        expect.objectContaining({
          body: expectedBody,
        }),
      );
    });
  });
});
