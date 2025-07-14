import { None, Some } from 'oxide.ts';

import type { Profile } from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';

export function getMockProfileService(): ProfileService {
  return {
    getProfile: (activeDirectoryId: string) => {
      const profile = getProfile(activeDirectoryId);
      return Promise.resolve(profile ? Some(profile) : None);
    },
    registerProfile: (activeDirectoryId: string) => {
      return Promise.resolve(registerProfile(activeDirectoryId));
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
    priorityLevelId: 1,
    profileStatusId: 1,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      personalRecordIdentifier: '123456789',
      preferredLanguageId: undefined,
      workEmail: 'firstname.lastname@email.ca',
      personalEmail: 'jane.doe@example.com',
      workPhone: undefined,
      personalPhone: '613-555-0001',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      classificationId: undefined,
      workUnitId: undefined,
      provinceId: undefined,
      cityId: undefined,
      wfaStatusId: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: ['864190000'],
      classificationIds: ['905190000', '905190001'],
      workLocationCitieIds: ['411290001', '411290002'],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: ['664190000', '664190001', '664190003'],
    },
  },
  {
    profileId: 2,
    userId: 2,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: 1,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
    personalInformation: {
      personalRecordIdentifier: undefined,
      preferredLanguageId: undefined,
      workEmail: '',
      personalEmail: undefined,
      workPhone: undefined,
      personalPhone: undefined,
      additionalInformation: undefined,
    },
    employmentInformation: {
      classificationId: undefined,
      workUnitId: undefined,
      provinceId: undefined,
      cityId: undefined,
      wfaStatusId: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: undefined,
      classificationIds: undefined,
      workLocationCitieIds: undefined,
      availableForReferralInd: undefined,
      interestedInAlternationInd: undefined,
      employmentTenureIds: undefined,
    },
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
function registerProfile(activeDirectoryId: string): Profile {
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
    priorityLevelId: 2,
    profileStatusId: 1,
    privacyConsentInd: true,
    userCreated: activeDirectoryId,
    dateCreated: new Date().toISOString(),
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      personalRecordIdentifier: '123456789',
      preferredLanguageId: undefined,
      workEmail: 'work.email@example.ca',
      personalEmail: 'personal.email@example.com',
      workPhone: undefined,
      personalPhone: '613-938-0001',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      classificationId: undefined,
      workUnitId: undefined,
      provinceId: undefined,
      cityId: undefined,
      wfaStatusId: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: ['864190000'],
      classificationIds: ['905190000', '905190001'],
      workLocationCitieIds: ['411290001', '411290002'],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: ['664190000', '664190001', '664190003'],
    },
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  return newProfile;
}
