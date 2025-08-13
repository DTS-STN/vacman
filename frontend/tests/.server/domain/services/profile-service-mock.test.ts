import { describe, it, expect } from 'vitest';

import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

describe('getMockProfileService', () => {
  const service = getMockProfileService();

  describe('registerProfile', () => {
    it('should return an Ok result with a new profile on success', async () => {
      const activeDirectoryId = '00000000-0000-0000-0000-000000000000';

      // The method now returns a Result object.
      const result = await service.registerProfile(activeDirectoryId);

      // Assert that the result is an `Ok` variant.
      expect(result.isOk()).toBe(true);

      // Unwrap the result to get the actual profile data for further assertions.
      const createdProfile = result.unwrap();

      expect(createdProfile.profileId).toBeDefined();
      expect(createdProfile.userId).toBeDefined();
      expect(createdProfile.userCreated).toBe(activeDirectoryId);
      expect(createdProfile.dateCreated).toBeDefined();
      expect(createdProfile.profileStatus.id).toBe(2);
      expect(createdProfile.privacyConsentInd).toBe(false);
      expect(createdProfile.referralPreferences.availableForReferralInd).toBe(true);
      expect(createdProfile.referralPreferences.interestedInAlternationInd).toBe(false);

      // Verify the profile was actually added to the mock data
      const retrievedProfile = await service.getProfileById('mock-token', createdProfile.profileId);
      expect(retrievedProfile.isOk()).toBe(true);
      expect(retrievedProfile.unwrap().profileId).toBe(createdProfile.profileId);
    });

    it('should correctly map to an existing user ID', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';

      const result = await service.registerProfile(activeDirectoryId);
      expect(result.isOk()).toBe(true);

      const createdProfile = result.unwrap();

      expect(createdProfile.profileId).toBeDefined();
      expect(createdProfile.userId).toBe(2); // Should map to existing user ID from mock data
      expect(createdProfile.userCreated).toBe(activeDirectoryId);
    });

    it('should handle multiple profile registrations with unique IDs', async () => {
      const freshService = getMockProfileService(); // Use a fresh instance for isolation

      const firstUser = 'first-user-123';
      const secondUser = 'second-user-456';

      // Register first profile
      const result1 = await freshService.registerProfile(firstUser);
      expect(result1.isOk()).toBe(true);
      const profile1 = result1.unwrap();

      // Register second profile
      const result2 = await freshService.registerProfile(secondUser);
      expect(result2.isOk()).toBe(true);
      const profile2 = result2.unwrap();

      // Assert that profiles are unique
      expect(profile1.profileId).toBeDefined();
      expect(profile2.profileId).toBeDefined();
      expect(profile2.profileId).not.toBe(profile1.profileId);
    });

    it('should return an Err result when the accessToken is "FAIL_TOKEN"', async () => {
      const failToken = 'FAIL_TOKEN';

      // The method now returns a Result object.
      const result = await service.registerProfile(failToken);

      // Assert that the result is an `Err` variant.
      expect(result.isErr()).toBe(true);

      // Unwrap the error to inspect its properties.
      const error = result.unwrapErr();

      // Assert that the error is the correct type and has the right details.
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.PROFILE_CREATE_FAILED);
      expect(error.message).toContain('Mock Error');
    });
  });
});
