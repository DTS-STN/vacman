import { Err, Ok } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import { apiClient } from './api-client';

import type {
  Profile,
  ProfileStatusUpdate,
  PagedProfileResponse,
  CollectionProfileResponse,
  ProfileQueryParams,
} from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultProfileService(): ProfileService {
  return {
    /**
     * Retrieves a paginated list of profiles with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated profile response or an error.
     */
    async getProfiles(params: ProfileQueryParams, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params.active !== undefined) searchParams.append('active', params.active.toString());
      if (params['hr-advisor']) searchParams.append('hr-advisor', params['hr-advisor']);

      const url = `/profiles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedProfileResponse>(url, 'retrieve paginated profiles', accessToken);

      if (result.isErr()) {
        return Err(result.unwrapErr());
      }

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
      const searchParams = new URLSearchParams();

      if (params.active !== undefined) searchParams.append('active', params.active.toString());

      const url = `/profiles/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<CollectionProfileResponse>(url, 'retrieve current user profiles', accessToken);

      if (result.isErr()) {
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());
    },

    /**
     * Registers a new profile for the current user.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created profile or an error.
     */
    async registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      const result = await apiClient.post<Record<string, never>, Profile>(
        '/profiles/me',
        'register new profile',
        {},
        accessToken,
      );

      if (result.isErr()) {
        const originalError = result.unwrapErr();
        return Err(
          new AppError(`Failed to register profile. Reason: ${originalError.message}`, ErrorCodes.PROFILE_CREATE_FAILED, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }

      return result;
    },

    /**
     * Retrieves a profile by its ID.
     * @param profileId The ID of the profile to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the profile or an error.
     */
    async getProfileById(profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      const result = await apiClient.get<Profile>(
        `/profiles/${profileId}`,
        `retrieve profile with ID ${profileId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Updates a profile by its ID.
     * @param profileId The ID of the profile to update.
     * @param profile The profile data to update.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the updated profile or an error.
     */
    async updateProfileById(profileId: number, profile: Profile, accessToken: string): Promise<Result<Profile, AppError>> {
      const result = await apiClient.put<Profile, Profile>(
        `/profiles/${profileId}`,
        `update profile with ID ${profileId}`,
        profile,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update profile. Reason: ${error.message}`, ErrorCodes.PROFILE_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

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
      const result = await apiClient.put<ProfileStatusUpdate, undefined>(
        `/profiles/${profileId}/status`,
        `update profile status for ID ${profileId}`,
        statusUpdate,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update profile status. Reason: ${error.message}`, ErrorCodes.PROFILE_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

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
