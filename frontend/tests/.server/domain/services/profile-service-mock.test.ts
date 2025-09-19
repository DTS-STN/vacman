import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProfilePutModel, ProfileStatusUpdate } from '~/.server/domain/models';
import { buildProfilesFromTemplates, getInitialMockUsers, mockProfiles, mockUsers } from '~/.server/domain/services/mock-data';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

// Re-assignable variables for our mock data
const profiles = mockProfiles;
const users = mockUsers;

const mockProfileService = getMockProfileService();

describe('ProfileServiceMock', () => {
  beforeEach(() => {
    // Clear the current users array.
    users.length = 0;
    // Repopulate it with a fresh copy of the initial state.
    mockUsers.push(...getInitialMockUsers());
    // Clear the current profiles array.
    profiles.length = 0;
    // Repopulate it by rebuilding from the templates.
    profiles.push(...buildProfilesFromTemplates());

    // Reset any mocks or side effects between tests
    vi.clearAllMocks();
  });

  describe('getProfiles', () => {
    it('should return paginated profiles successfully', async () => {
      const params = { page: 1, size: 10 };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toBeInstanceOf(Array);
        expect(response.page).toBeDefined();
        expect(response.page.number).toBe(1);
        expect(response.page.size).toBe(10);
        expect(response.page.totalElements).toBeGreaterThanOrEqual(0);
        expect(response.page.totalPages).toBeGreaterThanOrEqual(0);
      }
    });

    it('should filter by active status when specified', async () => {
      const params = { active: true };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        // Active profiles should have status codes like 'PENDING', 'APPROVED', 'INCOMPLETE'
        response.content.forEach((profile) => {
          expect(['PENDING', 'APPROVED', 'INCOMPLETE']).toContain(profile.profileStatus?.code);
        });
      }
    });

    it('should filter by HR advisor when specified', async () => {
      const params = { hrAdvisorId: '5' };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        response.content.forEach((profile) => {
          expect(profile.hrAdvisorId).toBe(5);
        });
      }
    });

    it('should handle empty results', async () => {
      const params = { hrAdvisorId: '999' }; // Non-existent HR advisor
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toEqual([]);
        expect(response.page.totalElements).toBe(0);
      }
    });

    it('should apply pagination correctly', async () => {
      const params = { page: 2, size: 2 };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.page.number).toBe(2);
        expect(response.page.size).toBe(2);
        expect(response.content.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('getCurrentUserProfiles', () => {
    it('should return current user profiles successfully', async () => {
      const params = { active: true };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getCurrentUserProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toBeInstanceOf(Array);
        response.content.forEach((profile) => {
          expect(profile).toHaveProperty('id');
          expect(profile).toHaveProperty('profileUser');
        });
      }
    });

    it('should filter by active status', async () => {
      const params = { active: true };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getCurrentUserProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        response.content.forEach((profile) => {
          expect(['PENDING', 'APPROVED', 'INCOMPLETE']).toContain(profile.profileStatus?.code);
        });
      }
    });
  });

  describe('findCurrentUserProfile', () => {
    it('should return current user profile successfully', async () => {
      const params = { active: true };
      const accessToken = 'valid-token';

      const result = await mockProfileService.findCurrentUserProfile(params, accessToken);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('profileUser');
      expect(result).toHaveProperty('profileStatus');
      expect(result.profileUser.id).toBe(1); // Mock data uses user ID 1
    });

    it('should throw AppError when no profiles are found', async () => {
      const params = { active: false }; // This should return no active profiles
      const accessToken = 'valid-token';

      await expect(mockProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(AppError);
      await expect(mockProfileService.findCurrentUserProfile(params, accessToken)).rejects.toThrow(
        'No active profile found for current user',
      );
    });

    it('should handle undefined active parameter', async () => {
      const params = {};
      const accessToken = 'valid-token';

      const result = await mockProfileService.findCurrentUserProfile(params, accessToken);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('profileUser');
    });
  });

  describe('registerProfile', () => {
    it('should register a new profile successfully', async () => {
      const accessToken = 'valid-token';
      const initialProfileCount = profiles.length;
      const initialUserCount = users.length;

      const result = await mockProfileService.registerProfile(accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('profileUser');
        expect(profile).toHaveProperty('profileStatus');
        expect(profile.profileStatus?.code).toBe('INCOMPLETE');
        expect(profile.createdBy).toBe(accessToken);
        expect(profile.createdDate).toBeDefined();
      }

      // Check that the data was actually added
      expect(profiles.length).toBe(initialProfileCount + 1);
      expect(users.length).toBe(initialUserCount + 1);
    });

    it('should create profile with default values', async () => {
      const accessToken = 'test-user';

      const result = await mockProfileService.registerProfile(accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.hasConsentedToPrivacyTerms).toBe(false);
        expect(profile.personalEmailAddress).toBe('personal.email@example.com');
        expect(profile.personalPhoneNumber).toBe('613-938-0001');
        expect(profile.additionalComment).toBe('Looking for opportunities in software development.');
      }
    });
  });

  describe('getProfileById', () => {
    it('should return profile when found', async () => {
      const profileId = 1;
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfileById(profileId, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(profileId);
        expect(profile).toHaveProperty('profileUser');
        expect(profile).toHaveProperty('profileStatus');
      }
    });

    it('should return error when profile not found', async () => {
      const profileId = 999;
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfileById(profileId, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
        expect(error.message).toContain('Profile with ID 999 not found');
      }
    });

    it('should handle various profile IDs', async () => {
      const testCases = [1, 2, 3, 4, 5];
      const accessToken = 'valid-token';

      for (const profileId of testCases) {
        const result = await mockProfileService.getProfileById(profileId, accessToken);

        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          const profile = result.unwrap();
          expect(profile.id).toBe(profileId);
        }
      }
    });
  });

  describe('updateProfileById', () => {
    it('should update profile successfully', async () => {
      const profileId = 1;
      const updatedProfile: ProfilePutModel = {
        additionalComment: 'Updated comment',
        hasConsentedToPrivacyTerms: true,
        isAvailableForReferral: false,
        personalEmailAddress: 'updated@example.com',
        personalPhoneNumber: '613-555-9999',
      };
      const accessToken = 'valid-token';

      const result = await mockProfileService.updateProfileById(profileId, updatedProfile, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(profileId);
        expect(profile.additionalComment).toBe('Updated comment');
        expect(profile.hasConsentedToPrivacyTerms).toBe(true);
        expect(profile.isAvailableForReferral).toBe(false);
        expect(profile.personalEmailAddress).toBe('updated@example.com');
        expect(profile.personalPhoneNumber).toBe('613-555-9999');
        expect(profile.lastModifiedDate).toBeDefined();
        expect(profile.lastModifiedBy).toBe('mock-user');
      }
    });

    it('should return error when profile not found', async () => {
      const profileId = 999;
      const updatedProfile: ProfilePutModel = {
        additionalComment: 'Updated comment',
      };
      const accessToken = 'valid-token';

      const result = await mockProfileService.updateProfileById(profileId, updatedProfile, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
        expect(error.message).toContain('Profile with ID 999 not found');
      }
    });

    it('should preserve existing fields when not provided', async () => {
      const profileId = 1;
      const partialUpdate: ProfilePutModel = {
        additionalComment: 'Only updating comment',
      };
      const accessToken = 'valid-token';

      // First get the original profile
      const originalResult = await mockProfileService.getProfileById(profileId, accessToken);
      expect(originalResult.isOk()).toBe(true);
      const originalProfile = originalResult.unwrap();

      // Update with partial data
      const result = await mockProfileService.updateProfileById(profileId, partialUpdate, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const updatedProfile = result.unwrap();
        expect(updatedProfile.additionalComment).toBe('Only updating comment');
        // Other fields should be preserved
        expect(updatedProfile.profileUser).toEqual(originalProfile.profileUser);
        expect(updatedProfile.profileStatus).toEqual(originalProfile.profileStatus);
      }
    });
  });

  describe('updateProfileStatus', () => {
    it('should update profile status successfully', async () => {
      const profileId = 1;
      const statusUpdate: ProfileStatusUpdate = {
        id: 3,
        code: 'APPROVED',
        nameEn: 'Approved',
        nameFr: 'Approuvé',
      };
      const accessToken = 'valid-token';

      const result = await mockProfileService.updateProfileStatus(profileId, statusUpdate, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // Verify the profile was updated by fetching it
        const profileResult = await mockProfileService.getProfileById(profileId, accessToken);
        expect(profileResult.isOk()).toBe(true);

        if (profileResult.isOk()) {
          const profile = profileResult.unwrap();
          expect(profile.profileStatus?.code).toBe('APPROVED');
          expect(profile.profileStatus?.nameEn).toBe('Approved');
          expect(profile.profileStatus?.nameFr).toBe('Approuvé');
          expect(profile.lastModifiedDate).toBeDefined();
          expect(profile.lastModifiedBy).toBe('system');
        }
      }
    });

    it('should return error when profile not found', async () => {
      const profileId = 999;
      const statusUpdate: ProfileStatusUpdate = {
        id: 3,
        code: 'APPROVED',
        nameEn: 'Approved',
        nameFr: 'Approuvé',
      };
      const accessToken = 'valid-token';

      const result = await mockProfileService.updateProfileStatus(profileId, statusUpdate, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.PROFILE_NOT_FOUND);
        expect(error.message).toContain('Profile with ID 999 not found');
      }
    });

    it('should use default values when status update fields are missing', async () => {
      const profileId = 2;
      const statusUpdate: ProfileStatusUpdate = {}; // Empty update
      const accessToken = 'valid-token';

      const result = await mockProfileService.updateProfileStatus(profileId, statusUpdate, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const profileResult = await mockProfileService.getProfileById(profileId, accessToken);
        expect(profileResult.isOk()).toBe(true);

        if (profileResult.isOk()) {
          const profile = profileResult.unwrap();
          expect(profile.profileStatus?.id).toBe(1);
          expect(profile.profileStatus?.code).toBe('PENDING');
          expect(profile.profileStatus?.nameEn).toBe('Pending');
          expect(profile.profileStatus?.nameFr).toBe('En attente');
        }
      }
    });
  });

  describe('findProfileById', () => {
    it('should return Some when profile exists', async () => {
      const profileId = 1;
      const accessToken = 'valid-token';

      const result = await mockProfileService.findProfileById(profileId, accessToken);

      expect(result.isSome()).toBe(true);
      if (result.isSome()) {
        const profile = result.unwrap();
        expect(profile.id).toBe(profileId);
      }
    });

    it('should return None when profile does not exist', async () => {
      const profileId = 999;
      const accessToken = 'valid-token';

      const result = await mockProfileService.findProfileById(profileId, accessToken);

      expect(result.isNone()).toBe(true);
    });

    it('should handle multiple profile lookups', async () => {
      const testCases = [
        { id: 1, shouldExist: true },
        { id: 2, shouldExist: true },
        { id: 999, shouldExist: false },
        { id: 3, shouldExist: true },
        { id: 1000, shouldExist: false },
      ];
      const accessToken = 'valid-token';

      for (const testCase of testCases) {
        const result = await mockProfileService.findProfileById(testCase.id, accessToken);

        if (testCase.shouldExist) {
          expect(result.isSome()).toBe(true);
          if (result.isSome()) {
            expect(result.unwrap().id).toBe(testCase.id);
          }
        } else {
          expect(result.isNone()).toBe(true);
        }
      }
    });
  });

  describe('Profile data validation', () => {
    it('should have valid profile structure in mock data', async () => {
      const params = { page: 1, size: 100 };
      const accessToken = 'valid-token';

      const result = await mockProfileService.getProfiles(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        response.content.forEach((profile) => {
          // Required fields
          expect(profile.id).toBeDefined();
          expect(typeof profile.id).toBe('number');

          // Optional fields that should have correct types when present
          if (profile.additionalComment !== undefined) {
            expect(typeof profile.additionalComment).toBe('string');
          }
          if (profile.hasConsentedToPrivacyTerms !== undefined) {
            expect(typeof profile.hasConsentedToPrivacyTerms).toBe('boolean');
          }
          if (profile.hrAdvisorId !== undefined) {
            expect(typeof profile.hrAdvisorId).toBe('number');
          }
          if (profile.isAvailableForReferral !== undefined) {
            expect(typeof profile.isAvailableForReferral).toBe('boolean');
          }
          if (profile.isInterestedInAlternation !== undefined) {
            expect(typeof profile.isInterestedInAlternation).toBe('boolean');
          }

          // Nested objects should have correct structure
          expect(profile.profileUser.id).toBeDefined();
          expect(typeof profile.profileUser.id).toBe('number');
          expect(profile.profileUser.firstName).toBeDefined();
          expect(typeof profile.profileUser.firstName).toBe('string');

          if (profile.profileStatus) {
            expect(profile.profileStatus.id).toBeDefined();
            expect(typeof profile.profileStatus.id).toBe('number');
            expect(profile.profileStatus.code).toBeDefined();
            expect(typeof profile.profileStatus.code).toBe('string');
            expect(profile.profileStatus.nameEn).toBeDefined();
            expect(typeof profile.profileStatus.nameEn).toBe('string');
            expect(profile.profileStatus.nameFr).toBeDefined();
            expect(typeof profile.profileStatus.nameFr).toBe('string');
          }

          if (profile.languageOfCorrespondence) {
            expect(profile.languageOfCorrespondence.id).toBeDefined();
            expect(typeof profile.languageOfCorrespondence.id).toBe('number');
            expect(profile.languageOfCorrespondence.code).toBeDefined();
            expect(typeof profile.languageOfCorrespondence.code).toBe('string');
          }
        });
      }
    });

    it('should have consistent data across service methods', async () => {
      const profileId = 1;
      const accessToken = 'valid-token';

      // Get profile via getProfileById
      const getResult = await mockProfileService.getProfileById(profileId, accessToken);
      expect(getResult.isOk()).toBe(true);
      const profileFromGet = getResult.unwrap();

      // Get profile via findProfileById
      const findResult = await mockProfileService.findProfileById(profileId, accessToken);
      expect(findResult.isSome()).toBe(true);
      const profileFromFind = findResult.unwrap();

      // Both should return the same profile data
      expect(profileFromGet).toEqual(profileFromFind);
    });
  });
});
