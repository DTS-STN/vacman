/**
 * Tests for profile utility functions.
 * This module tests the functions that handle profile retrieval, creation, and management.
 */
import { None, Some } from 'oxide.ts';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getProfileService } from '~/.server/domain/services/profile-service';
import {
  getUserProfile,
  createUserProfile,
  ensureUserProfile,
  hasUserProfile,
  safeGetUserProfile,
} from '~/.server/utils/profile-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Mock the profile service
vi.mock('~/.server/domain/services/profile-service');

const mockProfileService = {
  getProfile: vi.fn(),
  registerProfile: vi.fn(),
  updatePersonalInformation: vi.fn(),
  updateEmploymentInformation: vi.fn(),
  updateReferralPreferences: vi.fn(),
  submitProfileForReview: vi.fn(),
  getAllProfiles: vi.fn(),
};

vi.mocked(getProfileService).mockReturnValue(mockProfileService);

// Mock profile data
const mockProfile = {
  profileId: 1,
  userId: 1,
  profileStatusId: 1,
  privacyConsentInd: true,
  userCreated: 'test-user-123',
  dateCreated: '2024-01-01T00:00:00Z',
  personalInformation: {
    personalRecordIdentifier: '123456789',
    surname: 'Doe',
    givenName: 'John',
    dateOfBirth: '1990-01-01',
    preferredLanguage: 'en',
  },
  referralPreferences: {
    availableForReferralInd: true,
    interestedInAlternationInd: false,
    employmentTenureIds: ['664190000'],
  },
};

const mockNewProfile = {
  profileId: 2,
  userId: 2,
  profileStatusId: 1,
  privacyConsentInd: true,
  userCreated: 'test-user-456',
  dateCreated: '2024-01-02T00:00:00Z',
  personalInformation: {
    personalRecordIdentifier: '987654321',
    surname: 'Smith',
    givenName: 'Jane',
    dateOfBirth: '1992-05-15',
    preferredLanguage: 'fr',
  },
  referralPreferences: {
    availableForReferralInd: true,
    interestedInAlternationInd: false,
    employmentTenureIds: ['664190001'],
  },
};

describe('Profile Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return profile when it exists', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act
      const result = await getUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should return null when profile does not exist', async () => {
      // Arrange
      const activeDirectoryId = 'non-existent-user';
      mockProfileService.getProfile.mockResolvedValue(None);

      // Act
      const result = await getUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should propagate errors from profile service', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      const error = new AppError('Profile service error', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.getProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(getUserProfile(activeDirectoryId)).rejects.toBe(error);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should handle special characters in activeDirectoryId', async () => {
      // Arrange
      const activeDirectoryId = 'user@domain.com';
      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act
      const result = await getUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });
  });

  describe('createUserProfile', () => {
    it('should create and return a new profile', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-456';
      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act
      const result = await createUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockNewProfile);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should propagate errors from profile service', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-456';
      const error = new AppError('Profile creation failed', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.registerProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(createUserProfile(activeDirectoryId)).rejects.toBe(error);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should handle special characters in activeDirectoryId', async () => {
      // Arrange
      const activeDirectoryId = 'user.name@company.co.uk';
      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act
      const result = await createUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockNewProfile);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId);
    });
  });

  describe('ensureUserProfile', () => {
    it('should return existing profile when it exists', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act
      const result = await ensureUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
      expect(mockProfileService.registerProfile).not.toHaveBeenCalled();
    });

    it('should create new profile when it does not exist', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-456';
      mockProfileService.getProfile.mockResolvedValue(None);
      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act
      const result = await ensureUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockNewProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should propagate errors from profile retrieval', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      const error = new AppError('Profile retrieval failed', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.getProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(ensureUserProfile(activeDirectoryId)).rejects.toBe(error);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
      expect(mockProfileService.registerProfile).not.toHaveBeenCalled();
    });

    it('should propagate errors from profile creation', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-456';
      const error = new AppError('Profile creation failed', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.getProfile.mockResolvedValue(None);
      mockProfileService.registerProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(ensureUserProfile(activeDirectoryId)).rejects.toBe(error);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should handle both existing and new profile scenarios in sequence', async () => {
      // Arrange
      const activeDirectoryId1 = 'test-user-123';
      const activeDirectoryId2 = 'test-user-456';

      mockProfileService.getProfile
        .mockResolvedValueOnce(Some(mockProfile)) // First user has profile
        .mockResolvedValueOnce(None); // Second user needs profile
      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act
      const result1 = await ensureUserProfile(activeDirectoryId1);
      const result2 = await ensureUserProfile(activeDirectoryId2);

      // Assert
      expect(result1).toEqual(mockProfile);
      expect(result2).toEqual(mockNewProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(2);
      expect(mockProfileService.registerProfile).toHaveBeenCalledTimes(1);
      expect(mockProfileService.registerProfile).toHaveBeenCalledWith(activeDirectoryId2);
    });
  });

  describe('hasUserProfile', () => {
    it('should return true when profile exists', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act
      const result = await hasUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBe(true);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should return false when profile does not exist', async () => {
      // Arrange
      const activeDirectoryId = 'non-existent-user';
      mockProfileService.getProfile.mockResolvedValue(None);

      // Act
      const result = await hasUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBe(false);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should propagate errors from profile service', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      const error = new AppError('Profile service error', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.getProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(hasUserProfile(activeDirectoryId)).rejects.toBe(error);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });
  });

  describe('safeGetUserProfile', () => {
    it('should return profile when it exists', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act
      const result = await safeGetUserProfile(activeDirectoryId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should return null when profile does not exist', async () => {
      // Arrange
      const activeDirectoryId = 'non-existent-user';
      mockProfileService.getProfile.mockResolvedValue(None);

      // Act
      const result = await safeGetUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should return null when profile service throws error', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      const error = new AppError('Profile service error', ErrorCodes.VACMAN_API_ERROR);
      mockProfileService.getProfile.mockRejectedValue(error);

      // Act
      const result = await safeGetUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should return null for network errors', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-123';
      const networkError = new Error('Connection failed');
      mockProfileService.getProfile.mockRejectedValue(networkError);

      // Act
      const result = await safeGetUserProfile(activeDirectoryId);

      // Assert
      expect(result).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledWith(activeDirectoryId);
    });

    it('should handle multiple safe calls without throwing', async () => {
      // Arrange
      const activeDirectoryId1 = 'test-user-123';
      const activeDirectoryId2 = 'failing-user';
      const activeDirectoryId3 = 'non-existent-user';

      mockProfileService.getProfile
        .mockResolvedValueOnce(Some(mockProfile)) // First user has profile
        .mockRejectedValueOnce(new Error('Service failure')) // Second user throws error
        .mockResolvedValueOnce(None); // Third user has no profile

      // Act
      const result1 = await safeGetUserProfile(activeDirectoryId1);
      const result2 = await safeGetUserProfile(activeDirectoryId2);
      const result3 = await safeGetUserProfile(activeDirectoryId3);

      // Assert
      expect(result1).toEqual(mockProfile);
      expect(result2).toBeNull();
      expect(result3).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete profile lifecycle', async () => {
      // Arrange
      const activeDirectoryId = 'test-user-lifecycle';

      // Setup mock sequence: first 2 calls return None (no profile), then all subsequent calls return Some(profile)
      mockProfileService.getProfile
        .mockResolvedValueOnce(None) // First call from hasUserProfile
        .mockResolvedValueOnce(None) // Second call from ensureUserProfile
        .mockResolvedValue(Some(mockNewProfile)); // All subsequent calls return the profile

      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act & Assert - Check if profile exists (should be false)
      const hasProfile1 = await hasUserProfile(activeDirectoryId);
      expect(hasProfile1).toBe(false);

      // Act & Assert - Ensure profile exists (should create new one)
      const ensuredProfile = await ensureUserProfile(activeDirectoryId);
      expect(ensuredProfile).toEqual(mockNewProfile);

      // Act & Assert - Check if profile exists (should be true)
      const hasProfile2 = await hasUserProfile(activeDirectoryId);
      expect(hasProfile2).toBe(true);

      // Act & Assert - Get profile (should return existing)
      const profile = await getUserProfile(activeDirectoryId);
      expect(profile).toEqual(mockNewProfile);
    });

    it('should handle mixed success and error scenarios', async () => {
      // Arrange
      const existingUserId = 'existing-user';
      const newUserId = 'new-user';
      const errorUserId = 'error-user';

      mockProfileService.getProfile
        .mockResolvedValueOnce(Some(mockProfile)) // Existing user
        .mockResolvedValueOnce(None) // New user
        .mockRejectedValueOnce(new Error('API Error')); // Error user

      mockProfileService.registerProfile.mockResolvedValue(mockNewProfile);

      // Act & Assert
      const existingProfile = await safeGetUserProfile(existingUserId);
      expect(existingProfile).toEqual(mockProfile);

      const newProfile = await ensureUserProfile(newUserId);
      expect(newProfile).toEqual(mockNewProfile);

      const errorProfile = await safeGetUserProfile(errorUserId);
      expect(errorProfile).toBeNull();
    });

    it('should handle special characters and edge cases', async () => {
      // Arrange
      const specialUserIds = [
        'user@domain.com',
        'user.name+tag@company.co.uk',
        'user-123-456-789',
        'user_name_with_underscores',
        'UPPERCASE_USER_ID',
        'user%40encoded.com',
      ];

      mockProfileService.getProfile.mockResolvedValue(Some(mockProfile));

      // Act & Assert
      for (const userId of specialUserIds) {
        const profile = await getUserProfile(userId);
        expect(profile).toEqual(mockProfile);
        expect(mockProfileService.getProfile).toHaveBeenCalledWith(userId);
      }

      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(specialUserIds.length);
    });
  });
});
