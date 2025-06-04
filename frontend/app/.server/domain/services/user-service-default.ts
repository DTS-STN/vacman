import type { User, UserCreate } from '~/.server/domain/models';
import type { UserService } from '~/.server/domain/services/user-service';
import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultUserService(): UserService {
  return {
    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user to retrieve.
     * @returns A promise that resolves to the user object, or throws an error if not found.
     * @throws AppError if the request fails, if the user is not found, or if the server responds with an error status.
     */
    async getUserById(id: string): Promise<User> {
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
     * Registers a new user.
     * @param user The user data to create.
     * @returns A promise that resolves to the created user object.
     * @throws AppError if the request fails or if the server responds with an error status.
     */
    async registerUser(user: UserCreate): Promise<User> {
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
  };
}
