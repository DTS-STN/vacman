import type { User, UserCreate } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultUserService(): UserService {
  return {
    /**
     * Retrieves a list of users by their ROLE.
     * @param role The ROLE of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A promise that resolves to the list of user objects.
     */
    async getUsersByRole(role: string, accessToken: string): Promise<User[]> {
      const result = await apiClient.get<User[]>(`/users?type=${role}`, `retrieve users with role ${role}`, accessToken);

      if (result.isErr()) {
        throw result.unwrapErr();
      }

      return result.unwrap();
    },

    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A promise that resolves to the user object, or throws an error if not found.
     * @throws AppError if the request fails, if the user is not found, or if the server responds with an error status.
     */
    async getUserById(id: number, accessToken: string): Promise<User> {
      const result = await apiClient.get<User>(`/users/${id}`, `retrieve user with ID ${id}`, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          throw new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR);
        }
        throw error;
      }

      return result.unwrap();
    },

    async getCurrentUser(accessToken: string): Promise<User> {
      const result = await apiClient.get<User>('/users/me', 'get current user', accessToken);

      if (result.isErr()) {
        throw result.unwrapErr();
      }

      return result.unwrap();
    },

    async registerCurrentUser(user: UserCreate, accessToken: string): Promise<User> {
      const result = await apiClient.post<UserCreate, User>('/users/me', 'register current user', user, accessToken);

      if (result.isErr()) {
        throw result.unwrapErr();
      }

      return result.unwrap();
    },
  };
}
