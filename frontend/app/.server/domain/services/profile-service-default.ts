import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type {
  Profile,
  UserEmploymentInformation,
  UserPersonalInformation,
  UserReferralPreferences,
} from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import type { HttpStatusCode } from '~/errors/http-status-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultProfileService(): ProfileService {
  return {
    /**
     * Retrieves a profile by Active Directory ID.
     * @param activeDirectoryId The Active Directory ID of the user whose profile to retrieve.
     * @returns A promise that resolves to the profile object, or None if not found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getProfile(activeDirectoryId: string): Promise<Option<Profile>> {
      let response: Response;

      try {
        response = await fetch(
          `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/by-active-directory-id/${encodeURIComponent(activeDirectoryId)}`,
        );
      } catch (error) {
        throw new AppError(
          error instanceof Error
            ? error.message
            : `Network error while fetching profile for Active Directory ID ${activeDirectoryId}`,
          ErrorCodes.PROFILE_NETWORK_ERROR,
          { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
        );
      }

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return None;
      }

      if (!response.ok) {
        const errorMessage = `Failed to retrieve profile for Active Directory ID ${activeDirectoryId}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.PROFILE_FETCH_FAILED, {
          httpStatusCode: response.status as HttpStatusCode,
        });
      }

      try {
        const profile = await response.json();
        return Some(profile);
      } catch {
        throw new AppError(
          `Invalid JSON response while fetching profile for Active Directory ID ${activeDirectoryId}`,
          ErrorCodes.PROFILE_INVALID_RESPONSE,
          { httpStatusCode: HttpStatusCodes.BAD_GATEWAY },
        );
      }
    },

    /**
     * Registers a new profile for a user.
     * @param activeDirectoryId The Active Directory ID of the user to create a profile for.
     * @returns A promise that resolves to the created profile object.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async registerProfile(activeDirectoryId: string): Promise<Profile> {
      let response: Response;

      try {
        response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activeDirectoryId }),
        });
      } catch (error) {
        throw new AppError(
          error instanceof Error
            ? error.message
            : `Network error while registering profile for Active Directory ID ${activeDirectoryId}`,
          ErrorCodes.PROFILE_NETWORK_ERROR,
          { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
        );
      }

      if (!response.ok) {
        const errorMessage = `Failed to register profile for Active Directory ID ${activeDirectoryId}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.PROFILE_CREATE_FAILED, {
          httpStatusCode: response.status as HttpStatusCode,
        });
      }

      try {
        return await response.json();
      } catch {
        throw new AppError(
          `Invalid JSON response while registering profile for Active Directory ID ${activeDirectoryId}`,
          ErrorCodes.PROFILE_INVALID_RESPONSE,
          { httpStatusCode: HttpStatusCodes.BAD_GATEWAY },
        );
      }
    },

    /*TODO: There is no PATCH on the API for updating partial user profile,
      so we need to get the user profile data, and update the related fields inside the service, and then send it to the API for the update*/

    async updatePersonalInformation(
      activeDirectoryId: string,
      personalInfo: UserPersonalInformation,
    ): Promise<Result<void, AppError>> {
      try {
        const response = await fetch(`/profiles/${activeDirectoryId}/personal`, {
          method: 'PUT',
          body: JSON.stringify(personalInfo),
        });

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to update personal information. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_UPDATE_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        return Ok(undefined);
      } catch (error) {
        return Err(
          new AppError(
            error instanceof Error ? error.message : 'Failed to update personal information',
            ErrorCodes.PROFILE_NETWORK_ERROR,
            { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
          ),
        );
      }
    },
    async updateEmploymentInformation(
      activeDirectoryId: string,
      employmentInfo: UserEmploymentInformation,
    ): Promise<Result<void, AppError>> {
      try {
        const response = await fetch(`/profiles/${activeDirectoryId}/employment`, {
          method: 'PUT',
          body: JSON.stringify(employmentInfo),
        });

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to update employment preferences. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_UPDATE_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        return Ok(undefined);
      } catch (error) {
        return Err(
          new AppError(
            error instanceof Error ? error.message : 'Failed to update employment information',
            ErrorCodes.PROFILE_NETWORK_ERROR,
            { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
          ),
        );
      }
    },

    async updateReferralPreferences(
      activeDirectoryId: string,
      referralPrefs: UserReferralPreferences,
    ): Promise<Result<void, AppError>> {
      try {
        const response = await fetch(
          `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/${activeDirectoryId}/referral-preferences`,
          {
            method: 'PUT',
            body: JSON.stringify(referralPrefs),
          },
        );

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to update referral preferences. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_UPDATE_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        return Ok(undefined);
      } catch (error) {
        return Err(
          new AppError(
            error instanceof Error ? error.message : 'Failed to update referral preferences',
            ErrorCodes.PROFILE_NETWORK_ERROR,
            { httpStatusCode: HttpStatusCodes.SERVICE_UNAVAILABLE },
          ),
        );
      }
    },

    async submitProfileForReview(activeDirectoryId: string): Promise<Result<Profile, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles/${activeDirectoryId}/submit`, {
          method: 'POST',
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

    async approveProfile(activeDirectoryId: string): Promise<Result<Profile, AppError>> {
      try {
        const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles/${activeDirectoryId}/approve`, {
          method: 'POST',
        });

        if (!response.ok) {
          return Err(
            new AppError(
              `Failed to approve profile. Server responded with status ${response.status}`,
              ErrorCodes.PROFILE_APPROVE_FAILED,
              { httpStatusCode: response.status as HttpStatusCode },
            ),
          );
        }

        try {
          const profile = await response.json();
          return Ok(profile);
        } catch {
          return Err(
            new AppError('Invalid JSON response while approving profile', ErrorCodes.PROFILE_INVALID_RESPONSE, {
              httpStatusCode: HttpStatusCodes.BAD_GATEWAY,
            }),
          );
        }
      } catch (error) {
        return Err(
          new AppError(error instanceof Error ? error.message : 'Failed to approve profile', ErrorCodes.PROFILE_NETWORK_ERROR, {
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
  };
}
