import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import { apiClient } from './api-client';
import { getProfileStatusService } from './profile-status-service';

import type { Profile, ProfileStatus } from '~/.server/domain/models';
import type { ListProfilesParams, ProfileApiResponse, ProfileService } from '~/.server/domain/services/profile-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import queryClient from '~/query-client';

/**
 * Internal helper to fetch profiles based on filters.
 * @private
 */
async function getAllProfiles(params: ListProfilesParams): Promise<Result<readonly (Profile | null | undefined)[], AppError>> {
  const { accessToken, active, hrAdvisorId, includeUserData } = params;
  // The query key MUST be unique for every combination of parameters
  // to prevent cache collisions. An object ensures the key is stable.
  const queryKey = ['profiles', 'list', { active, hrAdvisorId, includeUserData, accessToken }];

  const queryFn = async (): Promise<readonly (Profile | null | undefined)[]> => {
    const searchParams = new URLSearchParams();

    if (active !== null && active !== undefined) {
      searchParams.append('active', String(active));
    }

    if (hrAdvisorId) {
      searchParams.append('hr-advisor', hrAdvisorId);
    }

    searchParams.append('user-data', String(includeUserData));

    const queryString = searchParams.toString();
    const endpoint = `/profiles${queryString ? `?${queryString}` : ''}`;
    const context = 'list filtered profiles';

    const response = await apiClient.get<ProfileApiResponse>(endpoint, context, accessToken);

    if (response.isErr()) {
      // Let fetchQuery handle the thrown error.
      throw response.unwrapErr();
    }
    return response.unwrap().content;
  };

  try {
    const data = await queryClient.fetchQuery<
      readonly (Profile | null | undefined)[],
      AppError,
      readonly (Profile | null | undefined)[],
      (string | object | undefined)[] // Updated query key type
    >({
      queryKey,
      queryFn,
    });
    return Ok(data);
  } catch (error) {
    return Err(error as AppError);
  }
}

export function getDefaultProfileService(): ProfileService {
  return {
    /**
     * Retrieves a profile by its ID from the profile service.
     *
     * @param accessToken The access token used to authenticate the request.
     * @param profileId The profile ID to retrieve.
     * @returns A Promise that resolves to:
     *   - Ok(Profile) if the profile is found.
     *   - Err(AppError) if the profile is not found or if the request fails.
     */
    async getProfileById(accessToken: string, profileId: number): Promise<Result<Profile, AppError>> {
      const result = await apiClient.get<Profile>(`/profiles/${profileId}`, 'fetch profile by ID', accessToken);

      return result.mapErr((error) => {
        if (error.errorCode === HttpStatusCodes.NOT_FOUND.toString()) {
          return new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND);
        }

        return new AppError(error.message, ErrorCodes.PROFILE_FETCH_FAILED);
      });
    },

    async findProfileById(accessToken: string, profileId: number): Promise<Option<Profile>> {
      const result = await this.getProfileById(accessToken, profileId);
      return result.ok();
    },

    /**
     * Registers a new profile for a user.
     * @param accessToken The access token of the user to create a profile for.
     * @returns A promise that resolves to the created profile object.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async registerProfile(accessToken: string): Promise<Result<Profile, AppError>> {
      const context = 'register a new user profile';
      const endpoint = '/profiles/me';
      // There's no request body needed for this specific POST request, so we pass an empty object.
      const requestBody = {};

      const result = await apiClient.post<typeof requestBody, Profile>(endpoint, context, requestBody, accessToken);

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
     * Updates an existing profile by its ID.
     *
     * @param accessToken The access token used for API authentication.
     * @param profile The profile object containing updated data.
     * @returns A Result containing the updated Profile on success,
     *          or an AppError on failure.
     *
     * The request sends the full Profile object in the body (PUT)
     * and expects the updated Profile in the response.
     */
    async updateProfileById(accessToken: string, profile: Profile): Promise<Result<Profile, AppError>> {
      const path = `/profiles/${profile.profileId}`;

      const result = await apiClient.put<Profile, Profile>(path, 'update profile', profile, accessToken);

      if (result.isErr()) {
        const originalError = result.unwrapErr();

        return Err(
          new AppError(`Failed to update profile. Reason: ${originalError.message}`, ErrorCodes.PROFILE_UPDATE_FAILED, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }

      return result;
    },

    async updateProfileStatus(
      accessToken: string,
      profileId: string,
      profileStatusCode: string,
    ): Promise<Result<ProfileStatus, AppError>> {
      const status: ProfileStatus | undefined = (await getProfileStatusService().listAll()).find(
        (status) => status.code === profileStatusCode,
      );

      const context = 'update a profile status';
      const endpoint = `/profiles/${profileId}/status`;

      const requestBody = { status };

      const result = await apiClient.put<typeof requestBody, ProfileStatus>(endpoint, context, requestBody, accessToken);

      if (result.isErr()) {
        const originalError = result.unwrapErr();

        return Err(
          new AppError(
            `Failed to update profile status. Reason: ${originalError.message}`,
            ErrorCodes.PROFILE_STATUS_UPDATE_FAILED,
            {
              httpStatusCode: originalError.httpStatusCode,
              correlationId: originalError.correlationId,
            },
          ),
        );
      }

      return result;
    },

    /**
     * Finds all profiles based on filters. Returns an Option.
     */
    async findAllProfiles(params: ListProfilesParams): Promise<Option<readonly Profile[]>> {
      const result = await getAllProfiles(params);

      return result
        .map((dirtyList) =>
          dirtyList.filter((item): item is Profile => {
            return item !== null && typeof item === 'object' && 'profileId' in item;
          }),
        )
        .ok();
    },

    /**
     * Retrieves a sanitized list of profiles based on filters. Throws on error.
     */
    async listAllProfiles(params: ListProfilesParams): Promise<readonly Profile[]> {
      const result = await getAllProfiles(params);

      if (result.isErr()) {
        const error = result.unwrapErr();
        throw new AppError(error.message, ErrorCodes.PROFILE_FETCH_FAILED, error);
      }

      const dirtyList = result.unwrap();

      // Sanitize the data before returning it.
      return dirtyList.filter((item): item is Profile => {
        return item !== null && typeof item === 'object' && 'profileId' in item;
      });
    },

    /**
     * Fetches the current active user profile from the API.
     *
     * Uses the provided access token to authenticate the request.
     * Returns an Option containing the profile if found and active,
     * or None if no active profile exists (i.e., HTTP 404 response).
     *
     * Throws an AppError for network issues, unexpected HTTP errors,
     * or JSON parsing failures.
     *
     * @param accessToken - The bearer token used for API authentication.
     * @returns A Promise resolving to Some(Profile) if found, or None if not found.
     */
    async getCurrentUserProfile(accessToken: string): Promise<Option<Profile>> {
      const result = await apiClient.get<Profile>('/profiles/me?active=true', 'fetch current user profile', accessToken);

      if (result.isErr()) {
        const err = result.unwrapErr();

        if (err.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return None;
        }

        throw err;
      }

      const profile = result.unwrap();
      return Some(profile);
    },
  };
}
