import { describe, it, expect } from 'vitest';

import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

describe('getMockProfileService', () => {
  const service = getMockProfileService();

  describe('getProfile', () => {
    it('should return a profile when given a valid Active Directory ID', async () => {
      const profile = await service.getProfile('00000000-0000-0000-0000-000000000001');

      expect(profile).toEqual({
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
      expect(profile).toBeNull();
    });
  });

  describe('registerProfile', () => {
    it('should create a new profile with generated metadata', async () => {
      const activeDirectoryId = 'test-user-new-profile';

      // Create a mock session for testing
      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            oid: activeDirectoryId,
            name: 'Test User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const createdProfile = await service.registerProfile(activeDirectoryId, mockSession);

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
      expect(retrievedProfile).not.toBeNull();
      expect(retrievedProfile?.profileId).toBe(createdProfile.profileId);
    });

    it('should create a profile for existing user mapping', async () => {
      const activeDirectoryId = '11111111-1111-1111-1111-111111111111';

      const mockSession: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: activeDirectoryId,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: activeDirectoryId,
            oid: activeDirectoryId,
            name: 'John Doe',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const createdProfile = await service.registerProfile(activeDirectoryId, mockSession);

      expect(createdProfile.profileId).toBeDefined();
      expect(createdProfile.userId).toBe(2); // Should map to existing user ID
      expect(createdProfile.userCreated).toBe(activeDirectoryId);
    });

    it('should handle multiple profile registrations', async () => {
      const service = getMockProfileService(); // Fresh instance

      const firstUser = 'first-user-123';
      const secondUser = 'second-user-456';

      const mockSession1: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: firstUser,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: firstUser,
            oid: firstUser,
            name: 'First User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      const mockSession2: AuthenticatedSession = {
        authState: {
          accessTokenClaims: {
            roles: ['employee'],
            sub: secondUser,
            aud: 'test-audience',
            client_id: 'test-client',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
            jti: 'test-jti',
          },
          idTokenClaims: {
            sub: secondUser,
            oid: secondUser,
            name: 'Second User',
            aud: 'test-audience',
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            iss: 'test-issuer',
          },
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
        },
      } as unknown as AuthenticatedSession;

      // Register first profile
      const profile1 = await service.registerProfile(firstUser, mockSession1);
      expect(profile1.profileId).toBeDefined();

      // Register second profile
      const profile2 = await service.registerProfile(secondUser, mockSession2);
      expect(profile2.profileId).toBeDefined();
      expect(profile2.profileId).not.toBe(profile1.profileId);

      // Verify both profiles exist
      const retrievedProfile1 = await service.getProfile(firstUser);
      const retrievedProfile2 = await service.getProfile(secondUser);

      expect(retrievedProfile1).not.toBeNull();
      expect(retrievedProfile2).not.toBeNull();
      expect(retrievedProfile1?.profileId).toBe(profile1.profileId);
      expect(retrievedProfile2?.profileId).toBe(profile2.profileId);
    });
  });
});
