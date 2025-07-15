import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { serverEnvironment } from '~/.server/environment';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('profile-service-default', () => {
  const profileService = getDefaultProfileService();
  const mockActiveDirectoryId = 'test-ad-id-123';

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
      classificationId: undefined,
      workUnitId: undefined,
      cityId: undefined,
      wfaStatusId: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: ['864190000'],
      classificationIds: ['905190000', '905190001'],
      workLocationCitiesIds: ['411290001', '411290002'],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: ['664190000', '664190001', '664190003'],
    },
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

      const result = await profileService.registerProfile(mockActiveDirectoryId);

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

      await expect(profileService.registerProfile(mockActiveDirectoryId)).rejects.toThrow();
    });

    it('should handle different error status codes', async () => {
      const errorStatus = HttpStatusCodes.UNAUTHORIZED;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: errorStatus,
      });

      await expect(profileService.registerProfile(mockActiveDirectoryId)).rejects.toThrow();
    });

    it('should throw AppError when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(profileService.registerProfile(mockActiveDirectoryId)).rejects.toThrow('Network error');
    });

    it('should send correct request body with activeDirectoryId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatusCodes.CREATED,
        json: vi.fn().mockResolvedValueOnce(mockProfile),
      });

      await profileService.registerProfile(mockActiveDirectoryId);

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
