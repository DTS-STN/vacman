import { Ok, Err } from 'oxide.ts';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import type { Profile } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { PREFERRED_LANGUAGE_FRENCH } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import queryClient from '~/query-client';

vi.unmock('~/.server/infra/query-client');

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
  const mockAccessToken = 'test-ad-id-123';

  const mockProfile: Profile = {
    profileId: 1,
    userId: 123,
    userIdReviewedBy: 456,
    userIdApprovedBy: 789,
    profileStatus: {
      id: 1,
      code: 'PENDING',
      nameEn: 'Pending approval',
      nameFr: "En attente d'approbation",
    },
    privacyConsentInd: true,
    userCreated: 'test-user',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'test-user',
    dateUpdated: '2024-01-01T00:00:00Z',
    personalInformation: {
      personalRecordIdentifier: '123456789',
      preferredLanguage: undefined,
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
      city: undefined,
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
      employmentOpportunityIds: [664190000, 664190001, 664190003],
    },
  };

  // A valid profile that we expect to be returned after sanitization
  const mockCleanProfile: Profile = {
    profileId: 1,
    userId: 123,
    userIdReviewedBy: 456,
    userIdApprovedBy: 789,
    profileStatus: {
      id: 1,
      code: 'PENDING',
      nameEn: 'Pending approval',
      nameFr: "En attente d'approbation",
    },
    privacyConsentInd: true,
    userCreated: 'test-user',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'test-user',
    dateUpdated: '2024-01-01T00:00:00Z',
    personalInformation: {
      personalRecordIdentifier: '444555666',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'firstname.lastname@example.ca',
      personalEmail: 'john.doe@example.com',
      workPhone: undefined,
      personalPhone: '555-0123',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      substantivePosition: 914190001,
      branchOrServiceCanadaRegion: 100789008,
      directorate: 294550040,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [864190000],
      classificationIds: [905190000, 905190001],
      workLocationProvince: 1,
      workLocationCitiesIds: [411290001, 411290002],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentOpportunityIds: [664190000, 664190001, 664190003],
    },
  };

  // An invalid item that should be filtered out by the service
  const mockInvalidItem = null;

  // The raw API response before sanitization
  const mockDirtyApiResponse = {
    content: [mockCleanProfile, mockInvalidItem],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('listAllProfiles', () => {
    it('should fetch, sanitize, and return profiles on success', async () => {
      // Arrange:
      vi.mocked(apiClient.get).mockResolvedValue(Ok(mockDirtyApiResponse));
      const params = { accessToken: mockAccessToken, includeUserData: true };

      // Act
      const result = await profileService.listAllProfiles('mock-token', params);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/profiles?user-data=true', 'list filtered profiles', mockAccessToken);
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Verify the final output is sanitized
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockCleanProfile);
    });

    it('should throw a specific AppError when the fetch fails', async () => {
      // Arrange:
      const mockApiError = new AppError('API is down', ErrorCodes.VACMAN_API_ERROR);
      vi.mocked(apiClient.get).mockResolvedValue(Err(mockApiError));
      const params = { accessToken: mockAccessToken, includeUserData: true };

      // Act & Assert
      await expect(profileService.listAllProfiles('mock-token', params)).rejects.toSatisfy((error: AppError) => {
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_FETCH_FAILED);
        expect(error.message).toContain(mockApiError.message);
        return true;
      });
    });
  });

  describe('findAllProfiles', () => {
    it('should return Some(sanitizedProfiles) on success', async () => {
      // Arrange
      vi.mocked(apiClient.get).mockResolvedValue(Ok(mockDirtyApiResponse));
      const params = { accessToken: mockAccessToken, includeUserData: true };

      // Act
      const result = await profileService.findAllProfiles('mock-token', params);

      // Assert
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap().length).toBe(1);
    });

    it('should return None() when the fetch fails', async () => {
      // Arrange
      const mockApiError = new AppError('API is down', ErrorCodes.VACMAN_API_ERROR);
      vi.mocked(apiClient.get).mockResolvedValue(Err(mockApiError));
      const params = { accessToken: mockAccessToken, includeUserData: true };

      // Act
      const result = await profileService.findAllProfiles('mock-token', params);

      // Assert
      expect(result.isNone()).toBe(true);
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
