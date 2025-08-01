import { None, Some, Err, Ok } from 'oxide.ts';
import type { Result } from 'oxide.ts';

import type {
  Profile,
  UserEmploymentInformation,
  UserPersonalInformation,
  UserReferralPreferences,
} from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { PROFILE_STATUS_ID } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockProfileService(): ProfileService {
  return {
    getProfile: (activeDirectoryId: string) => {
      const profile = getProfile(activeDirectoryId);
      return Promise.resolve(profile ? Some(profile) : None);
    },
    registerProfile: (activeDirectoryId: string) => {
      return Promise.resolve(registerProfile(activeDirectoryId));
    },
    updatePersonalInformation: (
      activeDirectoryId: string,
      personalInfo: UserPersonalInformation,
    ): Promise<Result<void, AppError>> => {
      const mockProfile = getProfile(activeDirectoryId);

      if (!mockProfile) {
        return Promise.resolve(Err(new AppError('Failed to update personal information', ErrorCodes.PROFILE_UPDATE_FAILED)));
      }

      const userId = activeDirectoryToUserIdMap[activeDirectoryId];

      mockProfiles = mockProfiles.map((profile) =>
        profile.userId === userId
          ? {
              ...profile,
              personalInformation: {
                ...profile.personalInformation,
                surname: personalInfo.surname,
                givenName: personalInfo.givenName,
                personalRecordIdentifier: personalInfo.personalRecordIdentifier,
                preferredLanguageId: personalInfo.preferredLanguageId,
                workEmail: personalInfo.workEmail,
                personalEmail: personalInfo.personalEmail,
                workPhone: personalInfo.workPhone,
                personalPhone: personalInfo.personalPhone,
                additionalInformation: personalInfo.additionalInformation,
              },
              dateUpdated: new Date().toISOString(),
              userUpdated: activeDirectoryId,
            }
          : profile,
      );

      return Promise.resolve(Ok(undefined));
    },
    updateEmploymentInformation: (
      activeDirectoryId: string,
      employmentInfo: UserEmploymentInformation,
    ): Promise<Result<void, AppError>> => {
      const mockProfile = getProfile(activeDirectoryId);

      if (!mockProfile) {
        return Promise.resolve(Err(new AppError('Failed to update employment information', ErrorCodes.PROFILE_UPDATE_FAILED)));
      }

      const userId = activeDirectoryToUserIdMap[activeDirectoryId];

      mockProfiles = mockProfiles.map((profile) =>
        profile.userId === userId
          ? {
              ...profile,
              employmentInformation: {
                ...profile.employmentInformation,
                substantivePosition: employmentInfo.substantivePosition,
                branchOrServiceCanadaRegion: employmentInfo.branchOrServiceCanadaRegion,
                directorate: employmentInfo.directorate,
                province: employmentInfo.province,
                cityId: employmentInfo.cityId,
                wfaStatus: employmentInfo.wfaStatus,
                wfaEffectiveDate: employmentInfo.wfaEffectiveDate,
                wfaEndDate: employmentInfo.wfaEndDate,
                hrAdvisor: employmentInfo.hrAdvisor,
              },
              dateUpdated: new Date().toISOString(),
              userUpdated: activeDirectoryId,
            }
          : profile,
      );

      return Promise.resolve(Ok(undefined));
    },
    updateReferralPreferences: (
      activeDirectoryId: string,
      referralPrefs: UserReferralPreferences,
    ): Promise<Result<void, AppError>> => {
      const mockProfile = getProfile(activeDirectoryId);

      if (!mockProfile) {
        return Promise.resolve(Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      const userId = activeDirectoryToUserIdMap[activeDirectoryId];

      mockProfiles = mockProfiles.map((profile) =>
        profile.userId === userId
          ? {
              ...profile,
              referralPreferences: {
                ...profile.referralPreferences,
                languageReferralTypeIds: referralPrefs.languageReferralTypeIds,
                classificationIds: referralPrefs.classificationIds,
                workLocationProvince: referralPrefs.workLocationProvince,
                workLocationCitiesIds: referralPrefs.workLocationCitiesIds,
                availableForReferralInd: referralPrefs.availableForReferralInd,
                interestedInAlternationInd: referralPrefs.interestedInAlternationInd,
                employmentTenureIds: referralPrefs.employmentTenureIds,
              },
              dateUpdated: new Date().toISOString(),
              userUpdated: activeDirectoryId,
            }
          : profile,
      );

      return Promise.resolve(Ok(undefined));
    },
    submitProfileForReview: (activeDirectoryId: string): Promise<Result<Profile, AppError>> => {
      const mockProfile = getProfile(activeDirectoryId);

      if (!mockProfile) {
        return Promise.resolve(Err(new AppError('Profile not found', ErrorCodes.PROFILE_NOT_FOUND)));
      }

      const userId = activeDirectoryToUserIdMap[activeDirectoryId];

      const updatedProfile: Profile = {
        ...mockProfile,
        profileStatusId: PROFILE_STATUS_ID.pending,
        dateUpdated: new Date().toISOString(),
        userUpdated: activeDirectoryId,
      };

      mockProfiles = mockProfiles.map((profile) => (profile.userId === userId ? updatedProfile : profile));

      return Promise.resolve(Ok(updatedProfile));
    },
    getAllProfiles: () => {
      return Promise.resolve(mockProfiles);
    },
  };
}

/**
 * Mock profile data for testing and development.
 */
let mockProfiles: Profile[] = [
  // TODO remove 'status' once all current PRs using it are merged
  {
    profileId: 1,
    userId: 1,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.pending,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Doe',
      givenName: 'Jane',
      personalRecordIdentifier: '123456789',
      preferredLanguageId: undefined,
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
      languageReferralTypeIds: [864190000],
      classificationIds: [905190000, 905190001],
      workLocationProvince: 1,
      workLocationCitiesIds: [411290001, 411290002],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190000, 664190001, 664190003],
    },
  },
  {
    profileId: 2,
    userId: 2,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: PROFILE_STATUS_ID.pending,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-01-01T00:00:00Z',
    userUpdated: 'jane.doe',
    dateUpdated: '2024-01-15T10:30:00Z',
    personalInformation: {
      surname: 'Smith',
      givenName: 'John',
      personalRecordIdentifier: undefined,
      preferredLanguageId: undefined,
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
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-02-01T09:00:00Z',
    userUpdated: 'john.smith',
    dateUpdated: '2024-02-10T14:00:00Z',
    personalInformation: {
      surname: 'fname',
      givenName: 'lname',
      personalRecordIdentifier: '987654321',
      preferredLanguageId: 1,
      workEmail: 'john.smith@email.ca',
      personalEmail: 'john.smith@example.com',
      workPhone: '613-555-1234',
      personalPhone: undefined,
      additionalInformation: 'Interested in remote work.',
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
      languageReferralTypeIds: [864190001],
      classificationIds: [905190002],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290003],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [664190002],
    },
  },
  {
    profileId: 4,
    userId: 4,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: PROFILE_STATUS_ID.pending,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-03-15T08:30:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Curie',
      givenName: 'Marie',
      personalRecordIdentifier: '555555555',
      preferredLanguageId: 2,
      workEmail: 'marie.curie@email.ca',
      personalEmail: 'marie.curie@example.com',
      workPhone: undefined,
      personalPhone: '613-555-5555',
      additionalInformation: 'Fluent in French and English.',
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
      languageReferralTypeIds: [864190002],
      classificationIds: [905190003],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290004],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190004],
    },
  },
  {
    profileId: 5,
    userId: 5,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 3,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-04-20T11:45:00Z',
    userUpdated: 'alex.tan',
    dateUpdated: '2024-05-01T10:00:00Z',
    personalInformation: {
      surname: 'Tan',
      givenName: 'Alex',
      personalRecordIdentifier: '222333444',
      preferredLanguageId: 1,
      workEmail: 'alex.tan@email.ca',
      personalEmail: 'alex.tan@example.com',
      workPhone: '613-555-2222',
      personalPhone: '613-555-3333',
      additionalInformation: 'Open to contract roles.',
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
      languageReferralTypeIds: [864190003],
      classificationIds: [905190004],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290005],
      availableForReferralInd: true,
      interestedInAlternationInd: true,
      employmentTenureIds: [664190005],
    },
  },
  {
    profileId: 6,
    userId: 6,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.pending,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-01T08:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Lee',
      givenName: 'Sam',
      personalRecordIdentifier: '111222333',
      preferredLanguageId: 1,
      workEmail: 'sam.lee@example.com',
      personalEmail: 'sam.lee.personal@example.com',
      workPhone: '613-555-1001',
      personalPhone: '613-555-1002',
      additionalInformation: 'Interested in project management.',
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
      languageReferralTypeIds: [864190004],
      classificationIds: [905190005],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290006],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190006],
    },
  },
  {
    profileId: 7,
    userId: 7,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-02T09:00:00Z',
    userUpdated: 'sam.lee',
    dateUpdated: '2024-06-12T10:00:00Z',
    personalInformation: {
      surname: 'Park',
      givenName: 'Linda',
      personalRecordIdentifier: '444555666',
      preferredLanguageId: 2,
      workEmail: 'linda.park@example.com',
      personalEmail: 'linda.park.personal@example.com',
      workPhone: '613-555-2001',
      personalPhone: '613-555-2002',
      additionalInformation: 'Fluent in French and English.',
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
      languageReferralTypeIds: [864190005],
      classificationIds: [905190006],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290007],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [664190007],
    },
  },
  {
    profileId: 8,
    userId: 8,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 3,
    profileStatusId: PROFILE_STATUS_ID.incomplete,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-06-03T10:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Gomez',
      givenName: 'Carlos',
      personalRecordIdentifier: '777888999',
      preferredLanguageId: 1,
      workEmail: 'carlos.gomez@example.com',
      personalEmail: 'carlos.gomez.personal@example.com',
      workPhone: '613-555-3001',
      personalPhone: '613-555-3002',
      additionalInformation: 'Looking for remote opportunities.',
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
    profileId: 9,
    userId: 9,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-04T11:00:00Z',
    userUpdated: 'carlos.gomez',
    dateUpdated: '2024-06-14T12:00:00Z',
    personalInformation: {
      surname: 'Singh',
      givenName: 'Priya',
      personalRecordIdentifier: '101112131',
      preferredLanguageId: 2,
      workEmail: 'priya.singh@example.com',
      personalEmail: 'priya.singh.personal@example.com',
      workPhone: '613-555-4001',
      personalPhone: '613-555-4002',
      additionalInformation: 'Interested in leadership roles.',
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
      languageReferralTypeIds: [864190006],
      classificationIds: [905190007],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290008],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190008],
    },
  },
  {
    profileId: 10,
    userId: 10,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: PROFILE_STATUS_ID.incomplete,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-05T12:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: undefined,
      givenName: 'Mohammed',
      personalRecordIdentifier: '141516171',
      preferredLanguageId: 1,
      workEmail: 'mohammedi@example.com',
      personalEmail: 'mohammed.personal@example.com',
      workPhone: '613-555-5001',
      personalPhone: '613-555-5002',
      additionalInformation: 'Open to relocation.',
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
      languageReferralTypeIds: [864190007],
      classificationIds: [905190008],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290009],
      availableForReferralInd: false,
      interestedInAlternationInd: true,
      employmentTenureIds: [664190009],
    },
  },
  {
    profileId: 11,
    userId: 11,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 3,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-06-06T13:00:00Z',
    userUpdated: 'mohammed.alfarsi',
    dateUpdated: '2024-06-16T14:00:00Z',
    personalInformation: {
      surname: undefined,
      givenName: 'Emily',
      personalRecordIdentifier: '181920212',
      preferredLanguageId: 2,
      workEmail: 'emily.chen@example.com',
      personalEmail: 'emily.chen.personal@example.com',
      workPhone: '613-555-6001',
      personalPhone: '613-555-6002',
      additionalInformation: 'Enjoys team collaboration.',
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
      languageReferralTypeIds: [864190008],
      classificationIds: [905190009],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290010],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190010],
    },
  },
  {
    profileId: 12,
    userId: 12,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.incomplete,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-07T14:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Brown',
      givenName: 'Olivia',
      personalRecordIdentifier: '222324252',
      preferredLanguageId: 1,
      workEmail: 'olivia.brown@example.com',
      personalEmail: 'olivia.brown.personal@example.com',
      workPhone: '613-555-7001',
      personalPhone: '613-555-7002',
      additionalInformation: 'Seeking growth opportunities.',
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
      languageReferralTypeIds: [864190009],
      classificationIds: [905190010],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290011],
      availableForReferralInd: true,
      interestedInAlternationInd: true,
      employmentTenureIds: [664190011],
    },
  },
  {
    profileId: 13,
    userId: 13,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 2,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-08T15:00:00Z',
    userUpdated: 'olivia.brown',
    dateUpdated: '2024-07-08T16:00:00Z',
    personalInformation: {
      surname: 'Kim',
      givenName: 'David',
      personalRecordIdentifier: '262728292',
      preferredLanguageId: 2,
      workEmail: 'david.kim@example.com',
      personalEmail: 'david.kim.personal@example.com',
      workPhone: '613-555-8001',
      personalPhone: '613-555-8002',
      additionalInformation: 'Interested in analytics.',
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
      languageReferralTypeIds: [864190010],
      classificationIds: [905190011],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290012],
      availableForReferralInd: false,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190012],
    },
  },
  {
    profileId: 14,
    userId: 14,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 3,
    profileStatusId: PROFILE_STATUS_ID.incomplete,
    privacyConsentInd: false,
    userCreated: 'system',
    dateCreated: '2024-06-09T16:00:00Z',
    userUpdated: undefined,
    dateUpdated: undefined,
    personalInformation: {
      surname: 'Rossi',
      givenName: 'Sofia',
      personalRecordIdentifier: '303132333',
      preferredLanguageId: 1,
      workEmail: 'sofia.rossi@example.com',
      personalEmail: 'sofia.rossi.personal@example.com',
      workPhone: '613-555-9001',
      personalPhone: '613-555-9002',
      additionalInformation: 'Open to international assignments.',
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
    profileId: 15,
    userId: 15,
    userIdReviewedBy: undefined,
    userIdApprovedBy: undefined,
    priorityLevelId: 1,
    profileStatusId: PROFILE_STATUS_ID.approved,
    privacyConsentInd: true,
    userCreated: 'system',
    dateCreated: '2024-06-10T17:00:00Z',
    userUpdated: 'sofia.rossi',
    dateUpdated: '2024-07-12T18:00:00Z',
    personalInformation: {
      surname: 'Muller',
      givenName: 'Tom',
      personalRecordIdentifier: '343536373',
      preferredLanguageId: 2,
      workEmail: 'tom.muller@example.com',
      personalEmail: 'tom.muller.personal@example.com',
      workPhone: '613-555-9101',
      personalPhone: '613-555-9102',
      additionalInformation: 'Interested in research.',
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
      languageReferralTypeIds: [864190011],
      classificationIds: [905190012],
      workLocationProvince: undefined,
      workLocationCitiesIds: [411290013],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190013],
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
    profileStatusId: PROFILE_STATUS_ID.incomplete,
    privacyConsentInd: true,
    userCreated: activeDirectoryId,
    dateCreated: new Date().toISOString(),
    userUpdated: activeDirectoryId,
    dateUpdated: new Date().toISOString(),
    personalInformation: {
      surname: 'Doe',
      givenName: 'John',
      personalRecordIdentifier: '123456789',
      preferredLanguageId: undefined,
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
      languageReferralTypeIds: [864190000],
      classificationIds: [905190000, 905190001],
      workLocationProvince: 1,
      workLocationCitiesIds: [411290001, 411290002],
      availableForReferralInd: true,
      interestedInAlternationInd: false,
      employmentTenureIds: [664190000, 664190001, 664190003],
    },
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  return newProfile;
}
