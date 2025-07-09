import type { User, UserCreate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultUserService(): UserService {
  return {
    /**
     * Retrieves a list of users by their ROLE.
     * @param role The ROLE of the user to retrieve.
     * @returns A promise that resolves to the list of user objects.
     */
    async getUsersByRole(role: string): Promise<User[]> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/users?role=${role}`);

      if (!response.ok) {
        const errorMessage = `Failed to retrieve users with role ${role}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user to retrieve.
     * @returns A promise that resolves to the user object, or throws an error if not found.
     * @throws AppError if the request fails, if the user is not found, or if the server responds with an error status.
     */
    async getUserById(id: number): Promise<User> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/users/${id}`);

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        throw new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR);
      }

      if (!response.ok) {
        const errorMessage = `Failed to retrieve user with ID ${id}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Retrieves a user by their Active Directory ID.
     * @param activeDirectoryId The Active Directory ID of the user to retrieve.
     * @returns A promise that resolves to the user object, or null if not found.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async getUserByActiveDirectoryId(activeDirectoryId: string): Promise<User | null> {
      const response = await fetch(
        `${serverEnvironment.VACMAN_API_BASE_URI}/users/by-active-directory-id/${encodeURIComponent(activeDirectoryId)}`,
      );

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        return null;
      }

      if (!response.ok) {
        const errorMessage = `Failed to retrieve user with Active Directory ID ${activeDirectoryId}. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Registers a new user.
     * @param user The user data to create.
     * @returns A promise that resolves to the created user object.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async registerUser(user: UserCreate, session: AuthenticatedSession): Promise<User> {
      const response = await fetch(`${serverEnvironment.VACMAN_API_BASE_URI}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorMessage = `Failed to register user. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Updates a user's role identified by their Active Directory ID.
     * @param activeDirectoryId The Active Directory ID of the user to update.
     * @param newRole The new role to assign to the user.
     * @param session The authenticated session.
     * @returns A promise that resolves to the updated user object.
     * @throws AppError if the request fails, if the user is not found, or if the server responds with an error status.
     */
    async updateUserRole(activeDirectoryId: string, newRole: string, session: AuthenticatedSession): Promise<User> {
      const response = await fetch(
        `${serverEnvironment.VACMAN_API_BASE_URI}/users/by-active-directory-id/${encodeURIComponent(activeDirectoryId)}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        throw new AppError(`User with Active Directory ID '${activeDirectoryId}' not found.`, ErrorCodes.VACMAN_API_ERROR);
      }

      if (!response.ok) {
        const errorMessage = `Failed to update user role. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },

    /**
     * Updates a user by ID with the provided partial user data.
     * @param id The ID of the user to update.
     * @param user The partial user data to update.
     * @param session The authenticated session.
     * @returns A promise that resolves to the updated user object.
     * @throws AppError if the request fails, if the user is not found, or if the server responds with an error status.
     */
    async updateUser(id: number, user: Partial<User>, session: AuthenticatedSession): Promise<User> {
      const response = await fetch(
        `${serverEnvironment.VACMAN_API_BASE_URI}/users/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
            role: user.role,
            networkName: user.networkName,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            initials: user.initials,
            personalRecordIdentifier: user.personalRecordIdentifier,
            businessPhone: user.businessPhone,
            businessEmail: user.businessEmail
          }),
        },
      );

      if (response.status === HttpStatusCodes.NOT_FOUND) {
        throw new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR);
      }

      if (!response.ok) {
        const errorMessage = `Failed to update user. Server responded with status ${response.status}.`;
        throw new AppError(errorMessage, ErrorCodes.VACMAN_API_ERROR);
      }

      return await response.json();
    },
  };
}
