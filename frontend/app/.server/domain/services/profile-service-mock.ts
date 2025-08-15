import { Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type {
  Profile,
  ProfilePutModel,
  ProfileStatusUpdate,
  PagedProfileResponse,
  CollectionProfileResponse,
  ProfileQueryParams,
} from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Debug logging utility for Profile Service Mock
const debugLog = (method: string, message: string, data?: unknown) => {
  console.log(`[ProfileService Mock] ${method}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

export function getMockProfileService(): ProfileService {
  return {
    /**
     * Retrieves a paginated list of profiles with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated profile response or an error.
     */
    async getProfiles(params: ProfileQueryParams, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      debugLog('getProfiles', 'Attempting to retrieve profiles', { params, accessTokenLength: accessToken.length });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate a failure case for testing error handling
      if (accessToken === 'FAIL_TOKEN') {
        const error = new AppError('Mock Error: Failed to retrieve profiles as requested.', ErrorCodes.VACMAN_API_ERROR, {
          httpStatusCode: HttpStatusCodes.BAD_REQUEST,
        });
        debugLog('getProfiles', 'Simulated failure for FAIL_TOKEN');
        return Err(error);
      }

      let filteredProfiles = [...mockProfiles];
      debugLog('getProfiles', `Starting with ${filteredProfiles.length} total profiles`);

      // Apply active filter
      if (params.active !== undefined) {
        const activeStatuses = [1, 2, 3]; // pending, approved, incomplete status IDs
        const inactiveStatuses = [4]; // archived status ID

        if (params.active === true) {
          filteredProfiles = filteredProfiles.filter((p) => p.profileStatus && activeStatuses.includes(p.profileStatus.id));
          debugLog('getProfiles', `Applied active filter (true): ${filteredProfiles.length} profiles remaining`);
        } else {
          filteredProfiles = filteredProfiles.filter((p) => p.profileStatus && inactiveStatuses.includes(p.profileStatus.id));
          debugLog('getProfiles', `Applied active filter (false): ${filteredProfiles.length} profiles remaining`);
        }
      }

      // Apply HR advisor filter
      if (params['hr-advisor']) {
        if (params['hr-advisor'] === 'me') {
          // For mock purposes, filter by hrAdvisorId = 1 when hr-advisor=me
          filteredProfiles = filteredProfiles.filter((p) => p.hrAdvisorId === 1);
          debugLog('getProfiles', `Applied HR advisor filter (me): ${filteredProfiles.length} profiles remaining`);
        } else {
          const hrAdvisorId = parseInt(params['hr-advisor'], 10);
          if (!isNaN(hrAdvisorId)) {
            filteredProfiles = filteredProfiles.filter((p) => p.hrAdvisorId === hrAdvisorId);
            debugLog(
              'getProfiles',
              `Applied HR advisor filter (${hrAdvisorId}): ${filteredProfiles.length} profiles remaining`,
            );
          }
        }
      }

      // Apply pagination
      const page = params.page ?? 0;
      const size = params.size ?? 10;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);
      debugLog(
        'getProfiles',
        `Applied pagination (page: ${page}, size: ${size}): ${paginatedProfiles.length} profiles in current page`,
      );

      const response: PagedProfileResponse = {
        content: paginatedProfiles,
        page: {
          number: page,
          size: size,
          totalElements: filteredProfiles.length,
          totalPages: Math.ceil(filteredProfiles.length / size),
        },
      };

      debugLog('getProfiles', 'Successfully retrieved profiles', {
        totalFiltered: filteredProfiles.length,
        pageSize: paginatedProfiles.length,
        currentPage: page,
      });
      return Ok(response);
    },

    /**
     * Retrieves profiles for the current user.
     * @param params Query parameters for filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the collection profile response or an error.
     */
    async getCurrentUserProfiles(
      params: Pick<ProfileQueryParams, 'active'>,
      accessToken: string,
    ): Promise<Result<CollectionProfileResponse, AppError>> {
      debugLog('getCurrentUserProfiles', 'Attempting to retrieve current user profiles', {
        params,
        accessTokenLength: accessToken.length,
      });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate a failure case for testing error handling
      if (accessToken === 'FAIL_TOKEN') {
        const error = new AppError(
          'Mock Error: Failed to retrieve current user profiles as requested.',
          ErrorCodes.VACMAN_API_ERROR,
          {
            httpStatusCode: HttpStatusCodes.BAD_REQUEST,
          },
        );
        debugLog('getCurrentUserProfiles', 'Simulated failure for FAIL_TOKEN');
        return Err(error);
      }

      // For mock purposes, return profiles for user ID 1
      let userProfiles = mockProfiles.filter((p) => p.profileUser?.id === 1);
      debugLog('getCurrentUserProfiles', `Found ${userProfiles.length} profiles for user ID 1`);

      // Apply active filter
      if (params.active !== undefined) {
        const activeStatuses = [1, 2, 3]; // pending, approved, incomplete status IDs
        const inactiveStatuses = [4]; // archived status ID

        if (params.active === true) {
          userProfiles = userProfiles.filter((p) => p.profileStatus && activeStatuses.includes(p.profileStatus.id));
          debugLog('getCurrentUserProfiles', `Applied active filter (true): ${userProfiles.length} profiles remaining`);
        } else {
          userProfiles = userProfiles.filter((p) => p.profileStatus && inactiveStatuses.includes(p.profileStatus.id));
          debugLog('getCurrentUserProfiles', `Applied active filter (false): ${userProfiles.length} profiles remaining`);
        }
      }

      const response: CollectionProfileResponse = {
        content: userProfiles,
      };

      debugLog('getCurrentUserProfiles', 'Successfully retrieved current user profiles', { profileCount: userProfiles.length });
      return Ok(response);
    },

    /**
     * Finds the current user's active profile (singular).
     * @param params Query parameters for filtering.
     * @param accessToken The access token for authorization.
     * @returns A single Profile object.
     * @throws AppError if no profile is found or if the request fails.
     */
    async findCurrentUserProfile(params: Pick<ProfileQueryParams, 'active'>, accessToken: string): Promise<Profile> {
      debugLog('findCurrentUserProfile', 'Attempting to retrieve current user profile', {
        params,
        accessTokenLength: accessToken.length,
      });

      const result = await this.getCurrentUserProfiles(params, accessToken);

      if (result.isErr()) {
        debugLog('findCurrentUserProfile', 'Failed to retrieve current user profile');
        throw result.unwrapErr();
      }

      const profiles = result.unwrap().content;
      if (profiles.length === 0) {
        const error = new AppError('No active profile found for current user', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
        debugLog('findCurrentUserProfile', 'No active profile found for current user');
        throw error;
      }

      const profile = profiles[0];
      if (!profile) {
        const error = new AppError('Profile data is invalid', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
        debugLog('findCurrentUserProfile', 'Profile data is invalid');
        throw error;
      }

      debugLog('findCurrentUserProfile', "Successfully retrieved current user's active profile", { profileId: profile.id });
      return profile;
    },

    /**
     * Registers a new profile for the current user.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created profile or an error.
     */
    async registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      debugLog('registerProfile', 'Attempting to register new profile', { accessTokenLength: accessToken.length });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate a failure case for testing error handling
      if (accessToken === 'FAIL_TOKEN') {
        const error = new AppError('Mock Error: Profile creation failed as requested.', ErrorCodes.PROFILE_CREATE_FAILED, {
          httpStatusCode: HttpStatusCodes.BAD_REQUEST,
        });
        debugLog('registerProfile', 'Simulated failure for FAIL_TOKEN');
        return Err(error);
      }

      const newProfile = createMockProfile(accessToken);
      debugLog('registerProfile', 'Successfully registered new profile', {
        profileId: newProfile.id,
        profileStatus: newProfile.profileStatus?.code,
      });
      return Ok(newProfile);
    },

    /**
     * Retrieves a profile by its ID.
     * @param profileId The ID of the profile to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the profile or an error.
     */
    async getProfileById(profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      debugLog('getProfileById', `Attempting to retrieve profile with ID: ${profileId}`, {
        accessTokenLength: accessToken.length,
      });
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      const profile = mockProfiles.find((p) => p.id === profileId);

      if (profile) {
        debugLog('getProfileById', `Successfully retrieved profile with ID: ${profileId}`, {
          profileStatus: profile.profileStatus?.code,
          userId: profile.profileUser?.id,
        });
        return Ok(profile);
      }

      debugLog('getProfileById', `Profile with ID ${profileId} not found`);
      return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
    },

    /**
     * Updates a profile by its ID.
     * @param profileId The ID of the profile to update.
     * @param profile The profile data to update.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the updated profile or an error.
     */
    async updateProfileById(
      profileId: number,
      profile: ProfilePutModel,
      accessToken: string,
    ): Promise<Result<Profile, AppError>> {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      const existingProfileIndex = mockProfiles.findIndex((p) => p.id === profileId);
      if (existingProfileIndex === -1) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const existingProfile = mockProfiles[existingProfileIndex];
      if (!existingProfile) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      // Convert ProfilePutModel to Profile by mapping ID fields to objects and merging with existing data
      const updatedProfile: Profile = {
        ...existingProfile,
        // Map ProfilePutModel properties to Profile properties
        additionalComment: profile.additionalComment ?? existingProfile.additionalComment,
        hasConsentedToPrivacyTerms: profile.hasConsentedToPrivacyTerms ?? existingProfile.hasConsentedToPrivacyTerms,
        hrAdvisorId: profile.hrAdvisorId ?? existingProfile.hrAdvisorId,
        isAvailableForReferral: profile.isAvailableForReferral ?? existingProfile.isAvailableForReferral,
        isInterestedInAlternation: profile.isInterestedInAlternation ?? existingProfile.isInterestedInAlternation,
        personalEmailAddress: profile.personalEmailAddress ?? existingProfile.personalEmailAddress,
        personalPhoneNumber: profile.personalPhoneNumber ?? existingProfile.personalPhoneNumber,
        // For ID-based fields, we would need to look up the full objects, but for mock purposes we'll preserve existing objects
        // In a real implementation, you would fetch the referenced entities by their IDs
        id: profileId, // Ensure ID doesn't change
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'mock-user',
      };

      mockProfiles[existingProfileIndex] = updatedProfile;
      return Ok(updatedProfile);
    },

    /**
     * Updates a profile's status.
     * @param profileId The ID of the profile to update.
     * @param statusUpdate The status update data.
     * @param accessToken The access token for authorization.
     * @returns A Result indicating success or an error.
     */
    async updateProfileStatus(
      profileId: number,
      statusUpdate: ProfileStatusUpdate,
      accessToken: string,
    ): Promise<Result<void, AppError>> {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      const existingProfileIndex = mockProfiles.findIndex((p) => p.id === profileId);
      if (existingProfileIndex === -1) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      // Create a mock status based on the update
      const newStatus = {
        id: statusUpdate.id ?? 1,
        code: statusUpdate.code ?? 'PENDING',
        nameEn: statusUpdate.nameEn ?? 'Pending',
        nameFr: statusUpdate.nameFr ?? 'En attente',
      };

      const existingProfile = mockProfiles[existingProfileIndex];
      if (!existingProfile) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const updatedProfile: Profile = {
        ...existingProfile,
        id: existingProfile.id, // Ensure id is preserved
        profileStatus: newStatus,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockProfiles[existingProfileIndex] = updatedProfile;
      return Ok(undefined);
    },

    /**
     * Finds a profile by its ID.
     * @param profileId The ID of the profile to find.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the profile if found, or None.
     */
    async findProfileById(profileId: number, accessToken: string): Promise<Option<Profile>> {
      const result = await this.getProfileById(profileId, accessToken);
      return result.ok();
    },
  };
}

/**
 * Mock profile data for testing and development.
 */
const mockProfiles: Profile[] = [
  {
    id: 1,
    additionalComment: 'Looking for opportunities in software development.',
    hasConsentedToPrivacyTerms: false,
    hrAdvisorId: undefined,
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    personalEmailAddress: 'jane.doe@example.com',
    personalPhoneNumber: '613-555-0001',
    languageOfCorrespondence: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    profileStatus: {
      id: 2,
      code: 'INCOMPLETE',
      nameEn: 'Incomplete',
      nameFr: 'Incomplet',
    },
    profileUser: {
      id: 1,
      businessEmailAddress: 'jane.doe@canada.ca',
      businessPhoneNumber: '+1-613-555-0101',
      firstName: 'Jane',
      initial: 'D',
      lastName: 'Doe',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000001',
      personalRecordIdentifier: '123456789',
      language: {
        id: 1,
        code: 'EN',
        nameEn: 'English',
        nameFr: 'Anglais',
      },
      userType: {
        id: 3,
        code: 'HR_ADVISOR',
        nameEn: 'HR Advisor',
        nameFr: 'Conseiller RH',
      },
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'system',
      lastModifiedDate: '2024-01-01T00:00:00Z',
    },
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: undefined,
    lastModifiedDate: undefined,
  },
  {
    id: 2,
    additionalComment: undefined,
    hasConsentedToPrivacyTerms: false,
    hrAdvisorId: undefined,
    isAvailableForReferral: undefined,
    isInterestedInAlternation: undefined,
    personalEmailAddress: undefined,
    personalPhoneNumber: undefined,
    languageOfCorrespondence: undefined,
    profileStatus: {
      id: 2,
      code: 'INCOMPLETE',
      nameEn: 'Incomplete',
      nameFr: 'Incomplet',
    },
    profileUser: {
      id: 2,
      businessEmailAddress: 'john.smith@canada.ca',
      businessPhoneNumber: '+1-613-555-0102',
      firstName: 'John',
      initial: 'S',
      lastName: 'Smith',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000002',
      personalRecordIdentifier: '987654321',
      language: {
        id: 1,
        code: 'EN',
        nameEn: 'English',
        nameFr: 'Anglais',
      },
      userType: {
        id: 1,
        code: 'EMPLOYEE',
        nameEn: 'Employee',
        nameFr: 'Employé',
      },
      createdBy: 'system',
      createdDate: '2024-01-01T00:00:00Z',
      lastModifiedBy: 'jane.doe',
      lastModifiedDate: '2024-01-15T10:30:00Z',
    },
    createdBy: 'system',
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedBy: 'jane.doe',
    lastModifiedDate: '2024-01-15T10:30:00Z',
  },
  {
    id: 3,
    additionalComment: 'Interested in remote work.',
    hasConsentedToPrivacyTerms: true,
    hrAdvisorId: 5,
    isAvailableForReferral: false,
    isInterestedInAlternation: true,
    personalEmailAddress: 'john.smith@example.com',
    personalPhoneNumber: '613-555-0001',
    languageOfCorrespondence: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    profileStatus: {
      id: 1,
      code: 'PENDING',
      nameEn: 'Pending',
      nameFr: 'En attente',
    },
    profileUser: {
      id: 3,
      businessEmailAddress: 'john.smith@canada.ca',
      businessPhoneNumber: '+1-613-555-0103',
      firstName: 'John',
      initial: 'S',
      lastName: 'Smith',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000003',
      personalRecordIdentifier: '987654321',
      language: {
        id: 1,
        code: 'EN',
        nameEn: 'English',
        nameFr: 'Anglais',
      },
      userType: {
        id: 1,
        code: 'EMPLOYEE',
        nameEn: 'Employee',
        nameFr: 'Employé',
      },
      createdBy: 'system',
      createdDate: '2024-02-01T09:00:00Z',
      lastModifiedBy: 'john.smith',
      lastModifiedDate: '2024-02-10T14:00:00Z',
    },
    createdBy: 'system',
    createdDate: '2024-02-01T09:00:00Z',
    lastModifiedBy: 'john.smith',
    lastModifiedDate: '2024-02-10T14:00:00Z',
  },
  {
    id: 4,
    additionalComment: 'Fluent in French and English.',
    hasConsentedToPrivacyTerms: true,
    hrAdvisorId: 5,
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    personalEmailAddress: 'marie.curie@example.com',
    personalPhoneNumber: '613-555-5555',
    languageOfCorrespondence: {
      id: 2,
      code: 'FR',
      nameEn: 'French',
      nameFr: 'Français',
    },
    profileStatus: {
      id: 3,
      code: 'APPROVED',
      nameEn: 'Approved',
      nameFr: 'Approuvé',
    },
    profileUser: {
      id: 4,
      businessEmailAddress: 'marie.curie@canada.ca',
      businessPhoneNumber: '+1-613-555-0104',
      firstName: 'Marie',
      initial: 'C',
      lastName: 'Curie',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000004',
      personalRecordIdentifier: '555555555',
      language: {
        id: 2,
        code: 'FR',
        nameEn: 'French',
        nameFr: 'Français',
      },
      userType: {
        id: 1,
        code: 'EMPLOYEE',
        nameEn: 'Employee',
        nameFr: 'Employé',
      },
      createdBy: 'system',
      createdDate: '2024-03-15T08:30:00Z',
      lastModifiedBy: 'john.smith',
      lastModifiedDate: '2024-02-10T14:00:00Z',
    },
    createdBy: 'system',
    createdDate: '2024-03-15T08:30:00Z',
    lastModifiedBy: 'john.smith',
    lastModifiedDate: '2024-02-10T14:00:00Z',
  },
  {
    id: 5,
    additionalComment: 'Open to contract roles.',
    hasConsentedToPrivacyTerms: true,
    hrAdvisorId: 5,
    isAvailableForReferral: true,
    isInterestedInAlternation: true,
    personalEmailAddress: 'alex.tan@example.com',
    personalPhoneNumber: '613-555-3333',
    languageOfCorrespondence: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    profileStatus: {
      id: 3,
      code: 'APPROVED',
      nameEn: 'Approved',
      nameFr: 'Approuvé',
    },
    profileUser: {
      id: 5,
      businessEmailAddress: 'alex.tan@canada.ca',
      businessPhoneNumber: '+1-613-555-0105',
      firstName: 'Alex',
      initial: 'T',
      lastName: 'Tan',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000005',
      personalRecordIdentifier: '222333444',
      language: {
        id: 1,
        code: 'EN',
        nameEn: 'English',
        nameFr: 'Anglais',
      },
      userType: {
        id: 1,
        code: 'EMPLOYEE',
        nameEn: 'Employee',
        nameFr: 'Employé',
      },
      createdBy: 'system',
      createdDate: '2024-04-20T11:45:00Z',
      lastModifiedBy: 'alex.tan',
      lastModifiedDate: '2024-05-01T10:00:00Z',
    },
    createdBy: 'system',
    createdDate: '2024-04-20T11:45:00Z',
    lastModifiedBy: 'alex.tan',
    lastModifiedDate: '2024-05-01T10:00:00Z',
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
  debugLog('createMockProfile', 'Creating new mock profile', { accessTokenLength: accessToken.length });
  let userId = activeDirectoryToUserIdMap[accessToken];
  if (!userId) {
    // Create new entry in activeDirectoryToUserIdMap if it doesn't exist
    userId = mockProfiles.length + 1;
    activeDirectoryToUserIdMap['00000000-0000-0000-0000-000000000000'] = userId;
    debugLog('createMockProfile', `Created new user mapping: userId ${userId}`);
  } else {
    debugLog('createMockProfile', `Using existing user mapping: userId ${userId}`);
  }

  // Create new profile
  const newProfile: Profile = {
    id: mockProfiles.length + 1,
    additionalComment: 'Looking for opportunities in software development.',
    hasConsentedToPrivacyTerms: false,
    hrAdvisorId: undefined,
    isAvailableForReferral: true,
    isInterestedInAlternation: false,
    personalEmailAddress: 'personal.email@example.com',
    personalPhoneNumber: '613-938-0001',
    languageOfCorrespondence: {
      id: 1,
      code: 'EN',
      nameEn: 'English',
      nameFr: 'Anglais',
    },
    profileStatus: {
      id: 2,
      code: 'INCOMPLETE',
      nameEn: 'Incomplete',
      nameFr: 'Incomplet',
    },
    profileUser: {
      id: userId,
      businessEmailAddress: 'work.email@example.ca',
      businessPhoneNumber: undefined,
      firstName: 'John',
      initial: 'D',
      lastName: 'Doe',
      middleName: undefined,
      microsoftEntraId: '00000000-0000-0000-0000-000000000000',
      personalRecordIdentifier: '123456789',
      language: {
        id: 1,
        code: 'EN',
        nameEn: 'English',
        nameFr: 'Anglais',
      },
      userType: {
        id: 1,
        code: 'EMPLOYEE',
        nameEn: 'Employee',
        nameFr: 'Employé',
      },
      createdBy: accessToken,
      createdDate: new Date().toISOString(),
      lastModifiedBy: accessToken,
      lastModifiedDate: new Date().toISOString(),
    },
    createdBy: accessToken,
    createdDate: new Date().toISOString(),
    lastModifiedBy: accessToken,
    lastModifiedDate: new Date().toISOString(),
  };

  // Add the new profile to the mock profiles array
  mockProfiles.push(newProfile);

  debugLog('createMockProfile', 'Successfully created mock profile', {
    profileId: newProfile.id,
    userId,
    totalProfiles: mockProfiles.length,
  });
  return newProfile;
}
