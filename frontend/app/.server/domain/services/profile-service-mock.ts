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
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getDirectorateService } from '~/.server/domain/services/directorate-service';
import { getEmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageReferralTypeService } from '~/.server/domain/services/language-referral-type-service';
import { createAndLinkNewMockProfile, mockProfiles } from '~/.server/domain/services/mockData';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { getWFAStatuses } from '~/.server/domain/services/wfa-status-service';
import { LogFactory } from '~/.server/logging';
import { PROFILE_STATUS_CODE, PROFILE_STATUS_ID } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

export function getMockProfileService(): ProfileService {
  return {
    /**
     * Retrieves a paginated list of profiles with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated profile response or an error.
     */
    async getProfiles(params: ProfileQueryParams, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      log.debug('Attempting to retrieve profiles', { params, accessTokenLength: accessToken.length });

      let filteredProfiles = [...mockProfiles];
      log.debug(`Starting with ${filteredProfiles.length} total profiles`);

      // Apply active filter
      if (params.active !== undefined) {
        const activeStatuses = [PROFILE_STATUS_ID.pending, PROFILE_STATUS_ID.approved, PROFILE_STATUS_ID.incomplete];
        const inactiveStatuses = [PROFILE_STATUS_ID.archived];

        if (params.active === true) {
          filteredProfiles = filteredProfiles.filter(
            (p) => p.profileStatus && activeStatuses.some((id) => id === p.profileStatus?.id),
          );
          log.debug(`Applied active filter (true): ${filteredProfiles.length} profiles remaining`);
        } else {
          filteredProfiles = filteredProfiles.filter(
            (p) => p.profileStatus && inactiveStatuses.some((id) => id === p.profileStatus?.id),
          );
          log.debug(`Applied active filter (false): ${filteredProfiles.length} profiles remaining`);
        }
      }

      // Apply HR advisor filter using hrAdvisorId param
      if (params.hrAdvisorId) {
        if (params.hrAdvisorId === 'me') {
          // For mock purposes, filter by hrAdvisorId = 1 when hrAdvisorId=me
          filteredProfiles = filteredProfiles.filter((p) => p.hrAdvisorId === 1);
          log.debug(`Applied HR advisor filter (me): ${filteredProfiles.length} profiles remaining`);
        } else {
          const hrAdvisorId = parseInt(params.hrAdvisorId);
          if (!isNaN(hrAdvisorId)) {
            filteredProfiles = filteredProfiles.filter((p) => p.hrAdvisorId === hrAdvisorId);
            log.debug(`Applied HR advisor filter (${hrAdvisorId}): ${filteredProfiles.length} profiles remaining`);
          }
        }
      }

      // Apply status filter using statusIds param (array of ids)
      if (params.statusIds?.length) {
        const statusIds = params.statusIds.filter((n) => Number.isFinite(n));
        filteredProfiles = filteredProfiles.filter((p) => (p.profileStatus ? statusIds.includes(p.profileStatus.id) : false));
        log.debug(`Applied statusId filter (${statusIds.join(',')}): ${filteredProfiles.length} profiles remaining`);
      }

      // Apply pagination
      const page = params.page ?? 0;
      const size = params.size ?? 10;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);
      log.debug(`Applied pagination (page: ${page}, size: ${size}): ${paginatedProfiles.length} profiles in current page`);

      const response: PagedProfileResponse = {
        content: paginatedProfiles,
        page: {
          number: page,
          size: size,
          totalElements: filteredProfiles.length,
          totalPages: Math.ceil(filteredProfiles.length / size),
        },
      };

      log.debug('Successfully retrieved profiles', {
        totalFiltered: filteredProfiles.length,
        pageSize: paginatedProfiles.length,
        currentPage: page,
      });
      return Promise.resolve(Ok(response));
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
      log.debug('Attempting to retrieve current user profiles', {
        params,
        accessTokenLength: accessToken.length,
      });

      // For mock purposes, return profiles for user ID 1
      let userProfiles = mockProfiles.filter((p) => p.profileUser.id === 1);
      log.debug(`Found ${userProfiles.length} profiles for user ID 1`);

      // Apply active filter
      if (params.active !== undefined) {
        const activeStatuses = [
          PROFILE_STATUS_CODE.incomplete,
          PROFILE_STATUS_CODE.approved,
          PROFILE_STATUS_CODE.pending,
        ] as string[];
        const inactiveStatuses = [PROFILE_STATUS_CODE.archived] as string[];

        if (params.active === true) {
          userProfiles = userProfiles.filter((p) => p.profileStatus && activeStatuses.includes(p.profileStatus.code));
          log.debug(`Applied active filter (true): ${userProfiles.length} profiles remaining`);
        } else {
          userProfiles = userProfiles.filter((p) => p.profileStatus && inactiveStatuses.includes(p.profileStatus.code));
          log.debug(`Applied active filter (false): ${userProfiles.length} profiles remaining`);
        }
      }

      const response: CollectionProfileResponse = {
        content: userProfiles,
      };

      log.debug('Successfully retrieved current user profiles', { profileCount: userProfiles.length });
      return Promise.resolve(Ok(response));
    },

    /**
     * Finds the current user's active profile (singular).
     * @param params Query parameters for filtering.
     * @param accessToken The access token for authorization.
     * @returns A single Profile object.
     * @throws AppError if no profile is found or if the request fails.
     */
    async findCurrentUserProfile(params: Pick<ProfileQueryParams, 'active'>, accessToken: string): Promise<Profile> {
      log.debug('Attempting to retrieve current user profile', {
        params,
        accessTokenLength: accessToken.length,
      });

      const result = await this.getCurrentUserProfiles(params, accessToken);

      if (result.isErr()) {
        log.debug('Failed to retrieve current user profile');
        throw result.unwrapErr();
      }

      const profiles = result.unwrap().content;
      if (profiles.length === 0) {
        const error = new AppError('No active profile found for current user', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
        log.debug('No active profile found for current user');
        throw error;
      }

      const profile = profiles[0];
      if (!profile) {
        const error = new AppError('Profile data is invalid', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
        log.debug('Profile data is invalid');
        throw error;
      }

      log.debug("Successfully retrieved current user's active profile", { profileId: profile.id });
      return profile;
    },

    /**
     * Registers a new profile for the current user.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created profile or an error.
     */
    async registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      log.debug('Attempting to register new profile', { accessTokenLength: accessToken.length });

      const newProfile = createAndLinkNewMockProfile(accessToken);
      log.debug('Successfully registered new profile', {
        profileId: newProfile.id,
        profileStatus: newProfile.profileStatus?.code,
      });
      return Promise.resolve(Ok(newProfile));
    },

    /**
     * Retrieves a profile by its ID.
     * @param profileId The ID of the profile to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the profile or an error.
     */
    async getProfileById(profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      log.debug(`Attempting to retrieve profile with ID: ${profileId}`, {
        accessTokenLength: accessToken.length,
      });

      const profile = mockProfiles.find((p) => p.id === profileId);

      if (profile) {
        log.debug(`Successfully retrieved profile with ID: ${profileId}`, {
          profileStatus: profile.profileStatus?.code,
          userId: profile.profileUser.id,
        });
        return Promise.resolve(Ok(profile));
      }

      log.debug(`Profile with ID ${profileId} not found`);
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
      const existingProfileIndex = mockProfiles.findIndex((p) => p.id === profileId);
      if (existingProfileIndex === -1) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const existingProfile = mockProfiles[existingProfileIndex];
      if (!existingProfile) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const languageOfCorrespondenceService = getLanguageForCorrespondenceService();
      const languageReferralTypeService = getLanguageReferralTypeService();
      const classificationService = getClassificationService();
      const cityService = getCityService();
      const employmentOppourtunityService = getEmploymentOpportunityTypeService();
      const directorateService = getDirectorateService();
      const wfaStatusService = getWFAStatuses();

      let languageOfCorrespondence = existingProfile.languageOfCorrespondence;
      if (profile.languageOfCorrespondenceId) {
        const langResult = await languageOfCorrespondenceService.getById(profile.languageOfCorrespondenceId);
        if (langResult.isOk()) {
          languageOfCorrespondence = langResult.unwrap();
        }
      }
      const preferredLanguages =
        profile.preferredLanguages !== undefined
          ? (await Promise.all(profile.preferredLanguages.map((id) => languageReferralTypeService.getById(id))))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())
          : existingProfile.preferredLanguages;

      const preferredClassifications =
        profile.preferredClassification !== undefined
          ? (await Promise.all(profile.preferredClassification.map((id) => classificationService.getById(id))))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())
          : existingProfile.preferredClassifications;

      const preferredCities =
        profile.preferredCities !== undefined
          ? (await Promise.all(profile.preferredCities.map((id) => cityService.getById(id))))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())
          : existingProfile.preferredCities;

      const preferredEmploymentOpportunities =
        profile.preferredEmploymentOpportunities !== undefined
          ? (await Promise.all(profile.preferredEmploymentOpportunities.map((id) => employmentOppourtunityService.getById(id))))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())
          : existingProfile.preferredEmploymentOpportunities;

      const substantiveClassification =
        profile.classificationId !== undefined
          ? (await Promise.all([classificationService.getById(profile.classificationId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingProfile.substantiveClassification;

      const substantiveWorkUnit =
        profile.workUnitId !== undefined
          ? (await Promise.all([directorateService.getById(profile.workUnitId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingProfile.substantiveWorkUnit;

      const substantiveCity =
        profile.cityId !== undefined
          ? (await Promise.all([cityService.getById(profile.cityId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingProfile.substantiveCity;

      const wfaStatus =
        profile.wfaStatusId !== undefined
          ? (await Promise.all([wfaStatusService.getById(profile.wfaStatusId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingProfile.wfaStatus;

      // Convert ProfilePutModel to Profile by mapping ID fields to objects and merging with existing data
      const updatedProfile: Profile = {
        ...existingProfile,
        // Map ProfilePutModel properties to Profile properties
        hasConsentedToPrivacyTerms: profile.hasConsentedToPrivacyTerms ?? existingProfile.hasConsentedToPrivacyTerms,
        isAvailableForReferral: profile.isAvailableForReferral ?? existingProfile.isAvailableForReferral,
        isInterestedInAlternation: profile.isInterestedInAlternation ?? existingProfile.isInterestedInAlternation,
        personalEmailAddress: profile.personalEmailAddress ?? existingProfile.personalEmailAddress,
        personalPhoneNumber: profile.personalPhoneNumber ?? existingProfile.personalPhoneNumber,
        // For ID-based fields, we would need to look up the full objects, but for mock purposes we'll preserve existing objects
        // In a real implementation, you would fetch the referenced entities by their IDs
        languageOfCorrespondence,
        preferredLanguages,
        preferredClassifications,
        preferredCities,
        preferredEmploymentOpportunities,

        hrAdvisorId: profile.hrAdvisorId,
        substantiveClassification,
        substantiveWorkUnit,
        substantiveCity,
        wfaStatus,
        wfaStartDate: profile.wfaStartDate,
        wfaEndDate: profile.wfaEndDate,

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
      const existingProfileIndex = mockProfiles.findIndex((p) => p.id === profileId);
      if (existingProfileIndex === -1) {
        return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const existingProfile = mockProfiles[existingProfileIndex];
      if (!existingProfile) {
        return Err(new AppError(`Existing Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      const newStatus = {
        id: statusUpdate.id ?? 1,
        code: statusUpdate.code ?? 'PENDING',
        nameEn: statusUpdate.nameEn ?? 'Pending',
        nameFr: statusUpdate.nameFr ?? 'En attente',
      };

      const updatedProfile: Profile = {
        ...existingProfile,
        profileStatus: newStatus,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockProfiles[existingProfileIndex] = updatedProfile;
      return Promise.resolve(Ok(undefined));
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
