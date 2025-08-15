import { None, Some, Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import { getMockCityService } from './city-service-mock';
import { getMockLanguageForCorrespondenceService } from './language-for-correspondence-service-mock';
import { getProfileStatusService } from './profile-status-service';
import { getMockProvinceService } from './province-service-mock';
import { getUserService } from './user-service';
import { getMockWFAStatusService } from './wfa-status-service-mock';

import type { Profile, ProfileStatus, SaveProfile } from '~/.server/domain/models';
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
        profile.personalInformation.preferredLanguageId !== undefined
          ? await getMockLanguageForCorrespondenceService().findById(profile.personalInformation.preferredLanguageId)
          : undefined;
      const preferredLanguage = preferredLanguageResult?.into();

      const wfaStatusResult =
        profile.employmentInformation.wfaStatusId !== undefined
          ? await getMockWFAStatusService().findById(profile.employmentInformation.wfaStatusId)
          : undefined;
      const wfaStatus = wfaStatusResult?.into();

      const provinceResult =
        profile.employmentInformation.provinceId !== undefined && (await getMockProvinceService().listAll());
      const province = provinceResult
        ? provinceResult.find((p) => p.id === profile.employmentInformation.provinceId)
        : undefined;

      const cityResult =
        profile.employmentInformation.cityId !== undefined &&
        (await getMockCityService().getById(profile.employmentInformation.cityId));
      const city = cityResult ? cityResult.unwrap() : undefined;

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
          wfaStatus,
          province,
          city,
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
          profile.profileUser.id === user.id &&
          (profile.profileStatus.id === PROFILE_STATUS_ID.incomplete ||
            profile.profileStatus.id === PROFILE_STATUS_ID.pending ||
            profile.profileStatus.id === PROFILE_STATUS_ID.approved),
      );

      return Promise.resolve(activeProfile ? Some(activeProfile) : None);
    },
  };
}

/**
 * Mock profile data for testing and development.
 */
let mockProfiles: Profile[] = [
  {
    profileId: 1,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    hasConsentedToPrivacyTerms: false,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    languageReferralTypeIds: [0],
    classificationIds: [0, 1],
    workLocationProvince: 1,
    workLocationCitiesIds: [1, 2],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [0, 1, 3],
    profileUser: {
      id: 1,
      businessEmailAddress: 'firstname.lastname@email.ca',
      businessPhoneNumber: undefined,
      firstName: 'Jane',
      lastName: 'Doe',
      personalRecordIdentifier: '123456789',
    },
    personalInformation: {
      preferredLanguage: undefined,
      personalEmail: 'jane.doe@example.com',
      personalPhone: '613-555-0001',
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
  },
  {
    profileId: 2,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    hasConsentedToPrivacyTerms: false,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
    languageReferralTypeIds: undefined,
    classificationIds: undefined,
    workLocationProvince: undefined,
    workLocationCitiesIds: undefined,
    isAvailableForReferral: undefined,
    isInterestedInAlternation: undefined,
    employmentOpportunityIds: undefined,
    profileUser: {
      id: 2,
      businessEmailAddress: 'example@email.ca',
      businessPhoneNumber: undefined,
      firstName: 'John',
      lastName: 'Smith',
      personalRecordIdentifier: undefined,
    },
    personalInformation: {
      preferredLanguage: undefined,
      personalEmail: undefined,
      personalPhone: undefined,
      additionalInformation: undefined,
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
  },
  {
    profileId: 3,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-02-01T09:00:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
    languageReferralTypeIds: [1],
    classificationIds: [2],
    workLocationProvince: 1,
    workLocationCitiesIds: [3],
    isAvailableForReferral: false,
    isInterestedInAlternation: true,
    employmentOpportunityIds: [2],
    profileUser: {
      id: 3,
      businessEmailAddress: 'john.smith@email.ca',
      businessPhoneNumber: undefined,
      firstName: 'fname',
      lastName: 'lname',
      personalRecordIdentifier: '987654321',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'john.smith@example.com',
      personalPhone: '613-555-0001',
      additionalInformation: 'Interested in remote work.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 4,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-03-15T08:30:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
    languageReferralTypeIds: [2],
    classificationIds: [3],
    workLocationProvince: undefined,
    workLocationCitiesIds: [4],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [3],
    profileUser: {
      id: 4,
      businessEmailAddress: 'marie.curie@email.ca',
      businessPhoneNumber: undefined,
      firstName: 'Marie',
      lastName: 'Curie',
      personalRecordIdentifier: '555555555',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'marie.curie@example.com',
      personalPhone: '613-555-5555',
      additionalInformation: 'Fluent in French and English.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 5,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-04-20T11:45:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
    languageReferralTypeIds: [0],
    classificationIds: [4],
    workLocationProvince: undefined,
    workLocationCitiesIds: [5],
    isAvailableForReferral: true,
    isInterestedInAlternation: true,
    employmentOpportunityIds: [1],
    profileUser: {
      id: 5,
      businessEmailAddress: 'alex.tan@email.ca',
      businessPhoneNumber: undefined,
      firstName: 'Alex',
      lastName: 'Tan',
      personalRecordIdentifier: '222333444',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'alex.tan@example.com',
      personalPhone: '613-555-3333',
      additionalInformation: 'Open to contract roles.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 6,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-01T08:00:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
    languageReferralTypeIds: [1],
    classificationIds: [5],
    workLocationProvince: undefined,
    workLocationCitiesIds: [6],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [2],
    profileUser: {
      id: 6,
      businessEmailAddress: 'sam.lee@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Sam',
      lastName: 'Lee',
      personalRecordIdentifier: '111222333',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'sam.lee.personal@example.com',
      personalPhone: '613-555-1002',
      additionalInformation: 'Interested in project management.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 7,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-02T09:00:00Z',
    userUpdated: 'linda.park',
    dateUpdated: '2024-06-12T10:00:00Z',
    languageReferralTypeIds: [2],
    classificationIds: [6],
    workLocationProvince: undefined,
    workLocationCitiesIds: [7],
    isAvailableForReferral: false,
    isInterestedInAlternation: true,
    employmentOpportunityIds: [3],
    profileUser: {
      id: 7,
      businessEmailAddress: 'linda.park@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Linda',
      lastName: 'Park',
      personalRecordIdentifier: '444555666',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'linda.park.personal@example.com',
      personalPhone: '613-555-2002',
      additionalInformation: 'Fluent in French and English.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 8,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-03T10:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-12T10:00:00Z',
    languageReferralTypeIds: undefined,
    classificationIds: undefined,
    workLocationProvince: undefined,
    workLocationCitiesIds: undefined,
    isAvailableForReferral: undefined,
    isInterestedInAlternation: undefined,
    employmentOpportunityIds: undefined,
    profileUser: {
      id: 8,
      businessEmailAddress: 'carlos.gomez@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Carlos',
      lastName: 'Gomez',
      personalRecordIdentifier: '777888999',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'carlos.gomez.personal@example.com',
      personalPhone: '613-555-3002',
      additionalInformation: 'Looking for remote opportunities.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 9,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-04T11:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-14T12:00:00Z',
    languageReferralTypeIds: [0],
    classificationIds: [7],
    workLocationProvince: undefined,
    workLocationCitiesIds: [8],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [0],
    profileUser: {
      id: 9,
      businessEmailAddress: 'priya.singh@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Priya',
      lastName: 'Singh',
      personalRecordIdentifier: '101112131',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'priya.singh.personal@example.com',
      personalPhone: '613-555-4002',
      additionalInformation: 'Interested in leadership roles.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 10,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-05T12:00:00Z',
    userUpdated: 'mohammed.ijaz',
    dateUpdated: '2024-06-14T12:00:00Z',
    languageReferralTypeIds: [1],
    classificationIds: [8],
    workLocationProvince: undefined,
    workLocationCitiesIds: [9],
    isAvailableForReferral: false,
    isInterestedInAlternation: true,
    employmentOpportunityIds: [1],
    profileUser: {
      id: 10,
      businessEmailAddress: 'mohammedi@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Mohammed',
      lastName: 'Ijaz',
      personalRecordIdentifier: '141516171',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'mohammed.personal@example.com',
      personalPhone: '613-555-5002',
      additionalInformation: 'Open to relocation.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 11,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_APPROVED,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-06T13:00:00Z',
    userUpdated: 'mohammed.alfarsi',
    dateUpdated: '2024-06-16T14:00:00Z',
    languageReferralTypeIds: [2],
    classificationIds: [9],
    workLocationProvince: undefined,
    workLocationCitiesIds: [10],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [2],
    profileUser: {
      id: 11,
      businessEmailAddress: 'emily.chen@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Emily',
      lastName: 'Neil',
      personalRecordIdentifier: '181920212',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'emily.chen.personal@example.com',
      personalPhone: '613-555-6002',
      additionalInformation: 'Enjoys team collaboration.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 1,
    },
  },
  {
    profileId: 12,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-07T14:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-10-14T12:00:00Z',
    languageReferralTypeIds: [0],
    classificationIds: [10],
    workLocationProvince: undefined,
    workLocationCitiesIds: [11],
    isAvailableForReferral: true,
    isInterestedInAlternation: true,
    employmentOpportunityIds: [3],
    profileUser: {
      id: 12,
      businessEmailAddress: 'olivia.brown@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Olivia',
      lastName: 'Brown',
      personalRecordIdentifier: '222324252',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'olivia.brown.personal@example.com',
      personalPhone: '613-555-7002',
      additionalInformation: 'Seeking growth opportunities.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 13,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-08T15:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-07-08T16:00:00Z',
    languageReferralTypeIds: [1],
    classificationIds: [11],
    workLocationProvince: undefined,
    workLocationCitiesIds: [12],
    isAvailableForReferral: false,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [0],
    profileUser: {
      id: 13,
      businessEmailAddress: 'david.kim@example.com',
      businessPhoneNumber: undefined,
      firstName: 'David',
      lastName: 'Kim',
      personalRecordIdentifier: '262728292',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'david.kim.personal@example.com',
      personalPhone: '613-555-8002',
      additionalInformation: 'Interested in analytics.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 14,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-09T16:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-08T16:00:00Z',
    languageReferralTypeIds: [0],
    classificationIds: [0, 1],
    workLocationProvince: 1,
    workLocationCitiesIds: [1, 2],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [0, 1, 3],
    profileUser: {
      id: 14,
      businessEmailAddress: 'sofia.rossi@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Sofia',
      lastName: 'Rossi',
      personalRecordIdentifier: '303132333',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_ENGLISH,
      personalEmail: 'sofia.rossi.personal@example.com',
      personalPhone: '613-555-9002',
      additionalInformation: 'Open to international assignments.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
    },
  },
  {
    profileId: 15,
    userIdReviewedBy: 5,
    userIdApprovedBy: 5,
    profileStatus: PROFILE_STATUS_PENDING,
    hasConsentedToPrivacyTerms: true,
    userCreated: 'system',
    dateCreated: '2024-06-10T17:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-12T18:00:00Z',
    languageReferralTypeIds: [2],
    classificationIds: [12],
    workLocationProvince: 1,
    workLocationCitiesIds: [13],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [1],
    profileUser: {
      id: 15,
      businessEmailAddress: 'tom.muller@example.com',
      businessPhoneNumber: undefined,
      firstName: 'Tom',
      lastName: 'Muller',
      personalRecordIdentifier: '343536373',
    },
    personalInformation: {
      preferredLanguage: PREFERRED_LANGUAGE_FRENCH,
      personalEmail: 'tom.muller.personal@example.com',
      personalPhone: '613-555-9102',
      additionalInformation: 'Interested in research.',
    },
    employmentInformation: {
      substantivePosition: 1,
      branchOrServiceCanadaRegion: 0,
      directorate: 2,
      province: undefined,
      city: undefined,
      wfaStatus: undefined,
      wfaEffectiveDate: undefined,
      wfaEndDate: undefined,
      hrAdvisor: 5,
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
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    profileStatus: PROFILE_STATUS_INCOMPLETE,
    hasConsentedToPrivacyTerms: false,
    userCreated: accessToken,
    dateCreated: new Date().toISOString(),
    userUpdated: accessToken,
    dateUpdated: new Date().toISOString(),
    languageReferralTypeIds: [0],
    classificationIds: [0, 1],
    workLocationProvince: 1,
    workLocationCitiesIds: [1, 2],
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    employmentOpportunityIds: [0, 1, 3],
    profileUser: {
      id: userId,
      businessEmailAddress: 'work.email@example.ca',
      businessPhoneNumber: undefined,
      firstName: 'John',
      lastName: 'Doe',
      personalRecordIdentifier: '123456789',
    },
    personalInformation: {
      preferredLanguage: undefined,
      personalEmail: 'personal.email@example.com',
      personalPhone: '613-938-0001',
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
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  return newProfile;
}
