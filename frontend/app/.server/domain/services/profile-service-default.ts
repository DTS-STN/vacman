import type { Profile } from '~/.server/domain/models';
import type { ProfileService } from '~/.server/domain/services/profile-service';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultProfileService(): ProfileService {
  return {
    /**
     * Retrieves a profile by Active Directory ID.
     * @param activeDirectoryId The Active Directory ID of the user whose profile to retrieve.
     * @returns A promise that resolves to the profile object, or null if not found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getProfile(activeDirectoryId: string): Promise<Profile | null> {
      const response = await fetch(
        `${serverEnvironment.VACMAN_API_BASE_URI}/profiles/by-active-directory-id/${encodeURIComponent(activeDirectoryId)}`,
      );

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return null;
      }

      if (!response.ok) {
        const errorMessage = `Failed to retrieve profile for Active Directory ID ${activeDirectoryId}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Registers a new profile for a user.
     * @param activeDirectoryId The Active Directory ID of the user to create a profile for.
     * @param session The authenticated session.
     * @returns A promise that resolves to the created profile object.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async registerProfile(activeDirectoryId: string, session: AuthenticatedSession): Promise<Profile> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeDirectoryId }),
      });

      if (!response.ok) {
        const errorMessage = `Failed to register profile for Active Directory ID ${activeDirectoryId}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
  };
}
