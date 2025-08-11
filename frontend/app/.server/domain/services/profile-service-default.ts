import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import { apiClient } from './api-client';

import type { Profile } from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

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

    async updateProfile(
      accessToken: string,
      profileId: number,
      userUpdated: string,
      data: Profile,
    ): Promise<Result<void, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles/${profileId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to update profile. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_UPDATE_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        return Ok(undefined);
      } catch (error) {
        return Err(
          new AppError(error instanceof Error ? error.message : 'Failed to update profile', ErrorCodes.PROFILE_NETWORK_ERROR, {
            httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE,
          }),
        );
      }
    },

    async submitProfileForReview(accessToken: string): Promise<Result<Profile, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to submit profile. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_SUBMIT_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        try {
          const profile = await response.json();
          return Ok(profile);
        } catch {
          return Err(
            new AppError('Invalid JSON response while submitting profile', ErrorCodes.PROFILE_INVALID_RESPONSE, {
              httpStatusCode: HttpStatusCodes.BAD_GATEWAY,
            }),
          );
        }
      } catch (error) {
        return Err(
          new AppError(error instanceof Error ? error.message : 'Failed to submit profile', ErrorCodes.PROFILE_NETWORK_ERROR, {
            httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE,
          }),
        );
      }
    },

    async getAllProfiles(): Promise<Profile[]> {
      let response: Response;
      try {
        response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles`);
      } catch (error) {
        throw new AppError(
          error instanceof Error ? error.message : `Network error while fetching all profiles`,
          ErrorCodes.PROFILE_NETWORK_ERROR,
          { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
        );
      }

      if (!response.ok) {
        const errorMessage = `Failed to retrieve all profiles. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.PROFILE_FETCH_FAILED, {
          httpStatusCode: response.status as HttpStatusCode,
        });
      }

      try {
        return await response.json();
      } catch {
        throw new AppError(`Invalid JSON response while fetching all profiles`, ErrorCodes.PROFILE_INVALID_RESPONSE, {
          httpStatusCode: HttpStatusCodes.BAD_GATEWAY,
        });
      }
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
