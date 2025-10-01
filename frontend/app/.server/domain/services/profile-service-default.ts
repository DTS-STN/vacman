import { Err, Ok } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type {
  Profile,
  ProfilePutModel,
  ProfileStatusUpdate,
  PagedProfileResponse,
  CollectionProfileResponse,
  ProfileQueryParams,
} from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

export function getDefaultProfileService(): ProfileService {
  return {
    /**
     * Retrieves a paginated list of profiles with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated profile response or an error.
     */
    async getProfiles(params: ProfileQueryParams, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      log.info('Fetching paginated profiles');
      log.debug('Profile search params', {
        page: params.page,
        size: params.size,
        active: params.active,
        hrAdvisorId: params.hrAdvisorId,
        statusIdsCount: params.statusIds?.length ?? 0,
        sort: params.sort,
      });
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params.active !== undefined) searchParams.append('active', params.active.toString());

      // New filters: hrAdvisorId and statusIds (appended as repeated statusId)
      if (params.hrAdvisorId) {
        searchParams.append('hrAdvisorId', params.hrAdvisorId);
      }
      if (params.statusIds?.length) {
        for (const id of params.statusIds) {
          searchParams.append('statusId', id.toString());
        }
      }
      // Sorting: append single 'sort' param in the format `property,(asc|desc)`
      if (params.sort) {
        searchParams.append('sort', params.sort);
      }

      const url = `/profiles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedProfileResponse>(url, 'retrieve paginated profiles', accessToken);

      if (result.isErr()) {
        log.error('Failed to fetch paginated profiles', result.unwrapErr());
        return Err(result.unwrapErr());
      }
      const page = result.unwrap();
      log.info('Fetched profiles page', { size: page.page.size, number: page.page.number, total: page.page.totalElements });
      return Ok(result.unwrap());
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
      log.info('Fetching current user profiles');
      log.debug('Current user profiles params', { active: params.active });
      const searchParams = new URLSearchParams();

      if (params.active !== undefined) searchParams.append('active', params.active.toString());

      const url = `/profiles/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<CollectionProfileResponse>(url, 'retrieve current user profiles', accessToken);

      if (result.isErr()) {
        log.error('Failed to fetch current user profiles', result.unwrapErr());
        return Err(result.unwrapErr());
      }
      const response = result.unwrap();
      log.info('Fetched current user profiles', { count: response.content.length });
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
      log.info('Finding current user active profile');
      const result = await this.getCurrentUserProfiles(params, accessToken);

      if (result.isErr()) {
        log.error('Error while fetching current user profiles', result.unwrapErr());
        throw result.unwrapErr();
      }

      const profiles = result.unwrap().content;
      if (profiles.length === 0) {
        log.warn('No active profile found for current user');
        throw new AppError('No active profile found for current user', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
      }

      const profile = profiles[0];
      if (!profile) {
        log.warn('Active profile record is invalid');
        throw new AppError('Profile data is invalid', ErrorCodes.PROFILE_NOT_FOUND, {
          httpStatusCode: HttpStatusCodes.NOT_FOUND,
        });
      }
      log.info('Found current user active profile', { id: profile.id });
      return profile;
    },

    /**
     * Registers a new profile for the current user.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created profile or an error.
     */
    async registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      log.info('Registering new profile for current user');
      const result = await apiClient.post<Record<string, never>, Profile>(
        '/profiles/me',
        'register new profile',
        {},
        accessToken,
      );

      if (result.isErr()) {
        const originalError = result.unwrapErr();
        log.error('Failed to register profile', originalError);
        return Err(
          new AppError(`Failed to register profile. Reason: ${originalError.message}`, ErrorCodes.PROFILE_CREATE_FAILED, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }
      log.info('Profile registered successfully');
      return result;
    },

    /**
     * Retrieves a profile by its ID.
     * @param profileId The ID of the profile to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the profile or an error.
     */
    async getProfileById(profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      log.info('Fetching profile by id', { profileId });
      const result = await apiClient.get<Profile>(
        `/profiles/${profileId}`,
        `retrieve profile with ID ${profileId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Profile not found', { profileId });
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        log.error('Failed to fetch profile by id', error);
        return Err(error);
      }
      log.info('Fetched profile by id successfully', { profileId });
      return Ok(result.unwrap());
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
      log.info('Updating profile', { profileId });
      const result = await apiClient.put<ProfilePutModel, Profile>(
        `/profiles/${profileId}`,
        `update profile with ID ${profileId}`,
        profile,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Profile not found while updating', { profileId });
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        log.error('Failed to update profile', error);
        return Err(
          new AppError(`Failed to update profile. Reason: ${error.message}`, ErrorCodes.PROFILE_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Profile updated successfully', { profileId });
      return result;
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
      log.info('Updating profile status', { profileId, statusId: statusUpdate.id, statusCode: statusUpdate.code });
      const result = await apiClient.put<ProfileStatusUpdate, undefined>(
        `/profiles/${profileId}/status`,
        `update profile status for ID ${profileId}`,
        statusUpdate,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Profile not found while updating status', { profileId });
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        log.error('Failed to update profile status', error);
        return Err(
          new AppError(`Failed to update profile status. Reason: ${error.message}`, ErrorCodes.PROFILE_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Profile status updated successfully', { profileId });
      return Ok(undefined);
    },

    /**
     * Finds a profile by its ID.
     * @param profileId The ID of the profile to find.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the profile if found, or None.
     */
    async findProfileById(profileId: number, accessToken: string): Promise<Option<Profile>> {
      log.debug('Finding profile by id', { profileId });
      const result = await this.getProfileById(profileId, accessToken);
      return result.ok();
    },
  };
}
