import { None, Some, Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import { getMockLanguageForCorrespondenceService } from './language-for-correspondence-service-mock';
import { getProfileStatusService } from './profile-status-service';
import { getUserService } from './user-service';

import type { Profile, ProfileStatus, SaveProfile, UserPersonalInformation } from '~/.server/domain/models';
import type { ListProfilesParams, ProfileService } from '~/.server/domain/services/profile-service';
import type { ProfileStatusCode } from '~/domain/constants';
import {
  PROFILE_STATUS_ID,
  PROFILE_STATUS_APPROVED,
  PROFILE_STATUS_INCOMPLETE,
  PROFILE_STATUS_PENDING,
  PREFERRED_LANGUAGE_ENGLISH,
  PREFERRED_LANGUAGE_FRENCH,
} from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getMockProfileService(): ProfileService {
  // Define what statuses are considered "active" for the mock filter.
  const activeStatuses: number[] = [PROFILE_STATUS_ID.pending, PROFILE_STATUS_ID.approved, PROFILE_STATUS_ID.incomplete];
  const inactiveStatuses: number[] = [PROFILE_STATUS_ID.archived];

  return {
    /**
     * Mocks the registration of a new profile.
     * - If the accessToken is 'FAIL_TOKEN', it returns an AppError.
     * - Otherwise, it returns a successfully created mock Profile.
     */
    registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      // Simulate a failure case for testing error handling in the UI.
      if (accessToken === 'FAIL_TOKEN') {
        const error = new AppError('Mock Error: Profile creation failed as requested.', ErrorCodes.PROFILE_CREATE_FAILED, {
          httpStatusCode: HttpStatusCodes.BAD_REQUEST,
        });
        return Promise.resolve(Err(error));
      }

      const newProfile = createMockProfile(accessToken);
      return Promise.resolve(Ok(newProfile));
    },
    getProfileById: (accessToken: string, profileId: number): Promise<Result<Profile, AppError>> => {
      const profile = mockProfiles.find((p) => p.profileId === profileId);

      if (profile) {
        return Promise.resolve(Ok(profile));
      }

      return Promise.resolve(Err(new AppError(`Profile not found.`, ErrorCodes.PROFILE_NOT_FOUND)));
    },
    findProfileById: async (accessToken: string, profileId: number): Promise<Option<Profile>> => {
      const profile = mockProfiles.find((p) => p.profileId === profileId);

      if (profile) {
        return Promise.resolve(Some(profile));
      }

      return Promise.resolve(None);
    },
    updateProfileById: async (accessToken: string, profile: SaveProfile): Promise<Result<Profile, AppError>> => {
      const existingProfile = mockProfiles.find((p) => p.profileId === profile.profileId);
      if (!existingProfile) {
        return Promise.resolve(Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }
      const preferredLanguageResult =
        profile.personalInformation.preferredLanguageId !== undefined &&
        (await getMockLanguageForCorrespondenceService().findById(profile.personalInformation.preferredLanguageId));
      const preferredLanguage =
        preferredLanguageResult && preferredLanguageResult.isSome() ? preferredLanguageResult.unwrap() : undefined;
      const updatedProfile: Profile = {
        ...existingProfile,
        ...profile,
        personalInformation: {
          ...profile.personalInformation,
          preferredLanguage,
        },
        employmentInformation: {
          ...existingProfile.employmentInformation,
          ...profile.employmentInformation,
        },
        referralPreferences: {
          ...existingProfile.referralPreferences,
          ...profile.referralPreferences,
        },
        dateUpdated: new Date().toISOString(),
        userUpdated: profile.userUpdated ?? existingProfile.userUpdated,
      };
      mockProfiles = mockProfiles.map((p) => (p.profileId === profile.profileId ? updatedProfile : p));
      return Promise.resolve(Ok(updatedProfile));
    },
    updateProfileStatus: async (
      accessToken: string,
      profileId: string,
      profileStatusCode: ProfileStatusCode,
    ): Promise<Result<ProfileStatus, AppError>> => {
      if (!mockProfiles.find((p) => p.profileId.toString() === profileId)) {
        return Promise.resolve(Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      const status = (await getProfileStatusService().listAll()).find((status) => status.code === profileStatusCode);

      if (!status) {
        return Err(new AppError(`Invalid status.`, ErrorCodes.PROFILE_STATUS_UPDATE_FAILED));
      }

      mockProfiles = mockProfiles.map((profile) =>
        profile.profileId.toString() === profileId
          ? {
              ...profile,
              profileStatus: status,
              dateUpdated: new Date().toISOString(),
            }
          : profile,
      );

      return Promise.resolve(Ok(status));
    },
    async findAllProfiles(accessToken: string, params: ListProfilesParams): Promise<Option<readonly Profile[]>> {
      // We can just call the other mock method to reuse the filtering logic.
      const result = await this.listAllProfiles(accessToken, params);
      return Promise.resolve(Some(result));
    },
    async listAllProfiles(accessToken: string, params: ListProfilesParams): Promise<readonly Profile[]> {
      let filtered = [...mockProfiles];

      // Simulate 'active' filter
      if (params.active === true) {
        filtered = filtered.filter((p) => activeStatuses.includes(p.profileStatus.id));
      } else if (params.active === false) {
        filtered = filtered.filter((p) => inactiveStatuses.includes(p.profileStatus.id));
      }
      // If params.active is null, we do nothing and return all profiles.

      // Simulate 'hrAdvisorId' filter
      if (params.hrAdvisorId) {
        // The mock doesn't know about "me", so we just filter by the string ID.
        const currentUser = await getUserService().getCurrentUser(accessToken);
        filtered = filtered.filter((p) => p.employmentInformation.hrAdvisor === currentUser.unwrap().id);
      }

      // Simulate 'includeUserData' transformation
      if (params.includeUserData === false) {
        // Return profiles without personal information.
        filtered = filtered.map((p) => ({
          ...p,
          personalInformation: emptyPersonalInformation,
        }));
      }

      return Promise.resolve(filtered);
    },
    getCurrentUserProfile: async (accessToken: string) => {
      const userOption = await getUserService().getCurrentUser(accessToken);

      if (userOption.isNone()) {
        return None;
      }

      const user = userOption.unwrap();

      // Find the active profile for this specific user
      const activeProfile = mockProfiles.find(
        (profile) =>
          profile.userId === user.id &&
          (profile.profileStatus.id === PROFILE_STATUS_ID.incomplete ||
            profile.profileStatus.id === PROFILE_STATUS_ID.pending ||
            profile.profileStatus.id === PROFILE_STATUS_ID.approved),
      );

      return Promise.resolve(activeProfile ? Some(activeProfile) : None);
    },
  };
}

const emptyPersonalInformation: UserPersonalInformation = {
  workEmail: '',
  surname: '',
  givenName: '',
};

/**
 * Mock profile data for testing and development.
 */
let mockProfiles: Profile[] = [
  {
    profileId: 1,
    userId: 1,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Doe',
      givenName: 'Jane',
      personalRecordIdentifier: '123456789',
      preferredLanguage: undefined,
      workEmail: 'firstname.lastname@email.ca',
      personalEmail: 'jane.doe@example.com',
      workPhone: undefined,
      personalPhone: '613-555-0001',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      substantivePosition: undefined,
      branchOrServiceCanadaRegion: undefined,
      directorate: undefined,
      province: undefined,
      cityId: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [0, 1],
      workLocationProvince: 1,
      workLocationCitiesIds: [1, 2],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [0, 1, 3],
    },
  },
  {
    profileId: 2,
    userId: 2,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
    personalInformation: {
      surname: 'Smith',
      givenName: 'John',
      personalRecordIdentifier: undefined,
      preferredLanguage: undefined,
      workEmail: 'example@email.ca',
      personalEmail: undefined,
      workPhone: undefined,
      personalPhone: undefined,
      additionalInformation: undefined,
    },
    employmentInformation: {
      substantivePosition: undefined,
      branchOrServiceCanadaRegion: undefined,
      directorate: undefined,
      province: undefined,
      cityId: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: undefined,
      classificationIds: undefined,
      workLocationProvince: undefined,
      workLocationCitiesIds: undefined,
      availableForReferralInd: undefined,
      interestedInAlternationInd: undefined,
      employmentTenureIds: undefined,
    },
  },
  {
    profileId: 3,
    userId: 3,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-02-01T09:00:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
    personalInformation: {
      surname: 'fname',
      givenName: 'lname',
      personalRecordIdentifier: '987654321',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'john.smith@email.ca',
      personalEmail: 'john.smith@example.com',
      workPhone: '613-555-1234',
      personalPhone: '613-555-0001',
      additionalInformation: 'Interested in remote work.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 0,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [1],
      classificationIds: [2],
      workLocationProvince: 1,
      workLocationCitiesIds: [3],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [2],
    },
  },
  {
    profileId: 4,
    userId: 4,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-03-15T08:30:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
    personalInformation: {
      surname: 'Curie',
      givenName: 'Marie',
      personalRecordIdentifier: '555555555',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'marie.curie@email.ca',
      personalEmail: 'marie.curie@example.com',
      workPhone: '613-555-5555',
      personalPhone: '613-555-5555',
      additionalInformation: 'Fluent in French and English.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [2],
      classificationIds: [3],
      workLocationProvince: undefined,
      workLocationCitiesIds: [4],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [3],
    },
  },
  {
    profileId: 5,
    userId: 5,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-04-20T11:45:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
    personalInformation: {
      surname: 'Tan',
      givenName: 'Alex',
      personalRecordIdentifier: '222333444',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'alex.tan@email.ca',
      personalEmail: 'alex.tan@example.com',
      workPhone: '613-555-2222',
      personalPhone: '613-555-3333',
      additionalInformation: 'Open to contract roles.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [4],
      workLocationProvince: undefined,
      workLocationCitiesIds: [5],
      availableForReferralInd: true,
      interestedInAlternationInd: true,
      employmentTenureIds: [1],
    },
  },
  {
    profileId: 6,
    userId: 6,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-01T08:00:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
    personalInformation: {
      surname: 'Lee',
      givenName: 'Sam',
      personalRecordIdentifier: '111222333',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'sam.lee@example.com',
      personalEmail: 'sam.lee.personal@example.com',
      workPhone: '613-555-1001',
      personalPhone: '613-555-1002',
      additionalInformation: 'Interested in project management.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [1],
      classificationIds: [5],
      workLocationProvince: undefined,
      workLocationCitiesIds: [6],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [2],
    },
  },
  {
    profileId: 7,
    userId: 7,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-02T09:00:00Z',
    userUpdated: 'linda.park',
    dateUpdated: '2024-06-12T10:00:00Z',
    personalInformation: {
      surname: 'Park',
      givenName: 'Linda',
      personalRecordIdentifier: '444555666',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'linda.park@example.com',
      personalEmail: 'linda.park.personal@example.com',
      workPhone: '613-555-2001',
      personalPhone: '613-555-2002',
      additionalInformation: 'Fluent in French and English.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [2],
      classificationIds: [6],
      workLocationProvince: undefined,
      workLocationCitiesIds: [7],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [3],
    },
  },
  {
    profileId: 8,
    userId: 8,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-03T10:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-12T10:00:00Z',
    personalInformation: {
      surname: 'Gomez',
      givenName: 'Carlos',
      personalRecordIdentifier: '777888999',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'carlos.gomez@example.com',
      personalEmail: 'carlos.gomez.personal@example.com',
      workPhone: '613-555-3001',
      personalPhone: '613-555-3002',
      additionalInformation: 'Looking for remote opportunities.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: undefined,
      classificationIds: undefined,
      workLocationProvince: undefined,
      workLocationCitiesIds: undefined,
      availableForReferralInd: undefined,
      interestedInAlternationInd: undefined,
      employmentTenureIds: undefined,
    },
  },
  {
    profileId: 9,
    userId: 9,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-04T11:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-14T12:00:00Z',
    personalInformation: {
      surname: 'Singh',
      givenName: 'Priya',
      personalRecordIdentifier: '101112131',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'priya.singh@example.com',
      personalEmail: 'priya.singh.personal@example.com',
      workPhone: '613-555-4001',
      personalPhone: '613-555-4002',
      additionalInformation: 'Interested in leadership roles.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [7],
      workLocationProvince: undefined,
      workLocationCitiesIds: [8],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [0],
    },
  },
  {
    profileId: 10,
    userId: 10,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-05T12:00:00Z',
    userUpdated: 'mohammed.ijaz',
    dateUpdated: '2024-06-14T12:00:00Z',
    personalInformation: {
      surname: 'Ijaz',
      givenName: 'Mohammed',
      personalRecordIdentifier: '141516171',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'mohammedi@example.com',
      personalEmail: 'mohammed.personal@example.com',
      workPhone: '613-555-5001',
      personalPhone: '613-555-5002',
      additionalInformation: 'Open to relocation.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [1],
      classificationIds: [8],
      workLocationProvince: undefined,
      workLocationCitiesIds: [9],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [1],
    },
  },
  {
    profileId: 11,
    userId: 11,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-06T13:00:00Z',
    userUpdated: 'mohammed.alfarsi',
    dateUpdated: '2024-06-16T14:00:00Z',
    personalInformation: {
      surname: 'Neil',
      givenName: 'Emily',
      personalRecordIdentifier: '181920212',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'emily.chen@example.com',
      personalEmail: 'emily.chen.personal@example.com',
      workPhone: '613-555-6001',
      personalPhone: '613-555-6002',
      additionalInformation: 'Enjoys team collaboration.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 1,
    },
    referralPreferences: {
      languageReferralTypeIds: [2],
      classificationIds: [9],
      workLocationProvince: undefined,
      workLocationCitiesIds: [10],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [2],
    },
  },
  {
    profileId: 12,
    userId: 12,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-07T14:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-10-14T12:00:00Z',
    personalInformation: {
      surname: 'Brown',
      givenName: 'Olivia',
      personalRecordIdentifier: '222324252',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'olivia.brown@example.com',
      personalEmail: 'olivia.brown.personal@example.com',
      workPhone: '613-555-7001',
      personalPhone: '613-555-7002',
      additionalInformation: 'Seeking growth opportunities.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [10],
      workLocationProvince: undefined,
      workLocationCitiesIds: [11],
      availableForReferralInd: true,
      interestedInAlternationInd: true,
      employmentTenureIds: [3],
    },
  },
  {
    profileId: 13,
    userId: 13,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-08T15:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-07-08T16:00:00Z',
    personalInformation: {
      surname: 'Kim',
      givenName: 'David',
      personalRecordIdentifier: '262728292',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'david.kim@example.com',
      personalEmail: 'david.kim.personal@example.com',
      workPhone: '613-555-8001',
      personalPhone: '613-555-8002',
      additionalInformation: 'Interested in analytics.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [1],
      classificationIds: [11],
      workLocationProvince: undefined,
      workLocationCitiesIds: [12],
      availableForReferralInd: false,
      interestedInAlternationInd: false,
      employmentTenureIds: [0],
    },
  },
  {
    profileId: 14,
    userId: 14,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-09T16:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-08T16:00:00Z',
    personalInformation: {
      surname: 'Rossi',
      givenName: 'Sofia',
      personalRecordIdentifier: '303132333',
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      workEmail: 'sofia.rossi@example.com',
      personalEmail: 'sofia.rossi.personal@example.com',
      workPhone: '613-555-9001',
      personalPhone: '613-555-9002',
      additionalInformation: 'Open to international assignments.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [0, 1],
      workLocationProvince: 1,
      workLocationCitiesIds: [1, 2],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [0, 1, 3],
    },
  },
  {
    profileId: 15,
    userId: 15,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_PENDING,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-10T17:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-12T18:00:00Z',
    personalInformation: {
      surname: 'Muller',
      givenName: 'Tom',
      personalRecordIdentifier: '343536373',
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      workEmail: 'tom.muller@example.com',
      personalEmail: 'tom.muller.personal@example.com',
      workPhone: '613-555-9101',
      personalPhone: '613-555-9102',
      additionalInformation: 'Interested in research.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: 1,
      cityId: 2,
      wfaStatus: 1,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
    referralPreferences: {
      languageReferralTypeIds: [2],
      classificationIds: [12],
      workLocationProvince: 1,
      workLocationCitiesIds: [13],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [1],
    },
  },
];

// Mock Active Directory ID to User ID mapping for profiles
const activeDirectoryToUserIdMap: Record<string, number> = {
  '00000000-0000-0000-0000-000000000001': 1,
  '11111111-1111-1111-1111-111111111111': 2,
};

/**
 * A private helper function to generate a mock profile.
 *
 * @param accessToken The access token of the user to create a profile for.
 * @returns The created profile object.
 * @throws {AppError} If the profile cannot be created (e.g., user not found).
 */
function createMockProfile(accessToken: string): Profile {
  let userId = activeDirectoryToUserIdMap[accessToken];
  if (!userId) {
    // Create new entry in activeDirectoryToUserIdMap if it doesn't exist
    userId = mockProfiles.length + 1;
    activeDirectoryToUserIdMap['00000000-0000-0000-0000-000000000000'] = userId;
  }

  // Create new profile
  const newProfile: Profile = {
    profileId: mockProfiles.length + 1,
    userId: userId,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    privacyConsentInd: false,
    userCreated: accessToken,
    dateCreated: new Date().toISOString(),
    userUpdated: accessToken,
    dateUpdated: new Date().toISOString(),
    personalInformation: {
      surname: 'Doe',
      givenName: 'John',
      personalRecordIdentifier: '123456789',
      preferredLanguage: undefined,
      workEmail: 'work.email@example.ca',
      personalEmail: 'personal.email@example.com',
      workPhone: undefined,
      personalPhone: '613-938-0001',
      additionalInformation: 'Looking for opportunities in software development.',
    },
    employmentInformation: {
      substantivePosition: undefined,
      branchOrServiceCanadaRegion: undefined,
      directorate: undefined,
      province: undefined,
      cityId: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: undefined,
    },
    referralPreferences: {
      languageReferralTypeIds: [0],
      classificationIds: [0, 1],
      workLocationProvince: 1,
      workLocationCitiesIds: [1, 2],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [0, 1, 3],
    },
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  return newProfile;
}
