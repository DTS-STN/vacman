import type { Profile } from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

export function getMockProfileService(): ProfileService {
  return {
    getProfile: (activeDirectoryId: string) => {
      return Promise.resolve(getProfile(activeDirectoryId));
    },
    registerProfile: (activeDirectoryId: string, session: AuthenticatedSession) => {
      return Promise.resolve(registerProfile(activeDirectoryId, session));
    },
  };
}

/**
 * Mock profile data for testing and development.
 */
const mockProfiles: Profile[] = [
  {
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
  },
  {
    profileId: 2,
    userId: 2,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    educationLevelId: 2,
    wfaStatusId: 1,
    classificationId: 2,
    cityId: 2,
    priorityLevelId: 2,
    workUnitId: 2,
    languageId: 1,
    profileStatusId: 1,
    personalPhoneNumber: '613-555-0002',
    personalEmailAddress: 'john.doe@example.com',
    privacyConsentInd: true,
    availableForReferralInd: false,
    interestedInAlternationInd: true,
    additionalCommentTxt: 'Interested in management positions.',
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
  },
];

// Mock Active Directory ID to User ID mapping for profiles
const activeDirectoryToUserIdMap: Record<string, number> = {
  '00000000-0000-0000-0000-000000000001': 1,
  '11111111-1111-1111-1111-111111111111': 2,
};

/**
 * Retrieves a profile by Active Directory ID from mock data.
 *
 * @param activeDirectoryId The Active Directory ID of the user whose profile to retrieve.
 * @returns The profile object if found, null otherwise.
 */
function getProfile(activeDirectoryId: string): Profile | null {
  const userId = activeDirectoryToUserIdMap[activeDirectoryId];
  if (!userId) {
    return null;
  }

  const profile = mockProfiles.find((p) => p.userId === userId);
  return profile ?? null;
}

/**
 * Registers a new profile with mock data.
 *
 * @param activeDirectoryId The Active Directory ID of the user to create a profile for.
 * @param session The authenticated session.
 * @returns The created profile object.
 * @throws {AppError} If the profile cannot be created (e.g., user not found).
 */
function registerProfile(activeDirectoryId: string, session: AuthenticatedSession): Profile {
  let userId = activeDirectoryToUserIdMap[activeDirectoryId];
  if (!userId) {
    // Create new entry in activeDirectoryToUserIdMap if it doesn't exist
    userId = mockProfiles.length + 1;
    activeDirectoryToUserIdMap[activeDirectoryId] = userId;
  }

  // Create new profile
  const newProfile: Profile = {
    profileId: mockProfiles.length + 1,
    userId: userId,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    educationLevelId: 2,
    wfaStatusId: 1,
    classificationId: 2,
    cityId: 2,
    priorityLevelId: 2,
    workUnitId: 2,
    languageId: 1,
    profileStatusId: 1,
    personalPhoneNumber: '613-555-0002',
    personalEmailAddress: 'john.doe@example.com',
    privacyConsentInd: true,
    availableForReferralInd: false,
    interestedInAlternationInd: true,
    additionalCommentTxt: 'Interested in management positions.',
    userCreated: session.authState.idTokenClaims.oid as string,
    dateCreated: new Date().toISOString(),
    userUpdated: undefined,
    dateUpdated: undefined,
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  return newProfile;
}
