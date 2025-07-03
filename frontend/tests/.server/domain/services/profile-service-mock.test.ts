import { describe, it, expect } from 'vitest';

import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';

describe('getMockProfileService', () => {
  const service = getMockProfileService();

  describe('getProfile', () => {
    it('should return a profile when given a valid Active Directory ID', async () => {
      const profile = await service.getProfile('00000000-0000-0000-0000-000000000001');

      expect(profile.isSome()).toBe(true);
      expect(profile.unwrap()).toEqual({
        profileId: 1,
        userId: 1,
        userIdReviewedBy: undefined,
        userIdApprovedBy: undefined,
        educationLevelId: 1,
        wfaStatusId: 1,
        classificationId: 1,
        cityId: 1,
        priorityLevelId: 1,
        workUnitId: 1,
        languageId: 1,
        profileStatusId: 1,
        personalPhoneNumber: '613-555-0001',
        personalEmailAddress: 'jane.doe@example.com',
        privacyConsentInd: true,
        availableForReferralInd: true,
        interestedInAlternationInd: false,
        additionalCommentTxt: 'Looking for opportunities in software development.',
        userCreated: 'system',
        dateCreated: '2024-01-01T00:00:00Z',
        userUpdated: undefined,
        dateUpdated: undefined,
      });
    });

    it('should return null when profile is not found', async () => {
      const profile = await service.getProfile('nonexistent-id');
      expect(profile.isNone()).toBe(true);
    });
  });

  describe('registerProfile', () => {
    it('should create a new profile with generated metadata', async () => {
      const activeDirectoryId = 'test-user-new-profile';

      const createdProfile = await service.registerProfile(activeDirectoryId);

      expect(createdProfile.profileId).toBeDefined();
      expect(createdProfile.userId).toBeDefined();
      expect(createdProfile.userCreated).toBe(activeDirectoryId);
      expect(createdProfile.dateCreated).toBeDefined();
      expect(createdProfile.profileStatusId).toBe(1);
      expect(createdProfile.privacyConsentInd).toBe(true);
      expect(createdProfile.availableForReferralInd).toBe(false);
      expect(createdProfile.interestedInAlternationInd).toBe(true);

      // Verify the profile was actually added to the mock data
      const retrievedProfile = await service.getProfile(activeDirectoryId);
      expect(retrievedProfile.isSome()).toBe(true);
      expect(retrievedProfile.unwrap().profileId).toBe(createdProfile.profileId);
    });

    it('should create a profile for existing user mapping', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';

      const createdProfile = await service.registerProfile(activeDirectoryId);

      expect(createdProfile.profileId).toBeDefined();
      expect(createdProfile.userId).toBe(2); // Should map to existing user ID
      expect(createdProfile.userCreated).toBe(activeDirectoryId);
    });

    it('should handle multiple profile registrations', async () => {
      const service = getMockProfileService(); // Fresh instance

      const firstUser = 'first-user-123';
      const secondUser = 'second-user-456';

      // Register first profile
      const profile1 = await service.registerProfile(firstUser);
      expect(profile1.profileId).toBeDefined();

      // Register second profile
      const profile2 = await service.registerProfile(secondUser);
      expect(profile2.profileId).toBeDefined();
      expect(profile2.profileId).not.toBe(profile1.profileId);

      // Verify both profiles exist
      const retrievedProfile1 = await service.getProfile(firstUser);
      const retrievedProfile2 = await service.getProfile(secondUser);

      expect(retrievedProfile1.isSome()).toBe(true);
      expect(retrievedProfile2.isSome()).toBe(true);
      expect(retrievedProfile1.unwrap().profileId).toBe(profile1.profileId);
      expect(retrievedProfile2.unwrap().profileId).toBe(profile2.profileId);
    });
  });
});
