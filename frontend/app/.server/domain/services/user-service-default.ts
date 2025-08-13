import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate } from '~/.server/domain/models';
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
     * @returns A Result containing the list of user objects or an error.
     */
    async getUsersByRole(role: string, accessToken: string): Promise<Result<User[], AppError>> {
      const result = await apiClient.get<User[]>(`/users?type=${role}`, `retrieve users with role ${role}`, accessToken);

      if (result.isErr()) {
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());
    },

    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the user object or an error.
     */
    async getUserById(id: number, accessToken: string): Promise<Result<User, AppError>> {
      const result = await apiClient.get<User>(`/users/${id}`, `retrieve user with ID ${id}`, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Finds a user by their ID.
     * @param id The ID of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the user object if found, or None.
     */
    async findUserById(id: number, accessToken: string): Promise<Option<User>> {
      const result = await this.getUserById(id, accessToken);
      return result.ok();
    },

    /**
     * Retrieves the current user.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the user object if found, or None.
     */
    async getCurrentUser(accessToken: string): Promise<Option<User>> {
      const result = await apiClient.get<User>('/users/me', 'get current user', accessToken);

      if (result.isErr()) {
        const err = result.unwrapErr();

        if (err.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return None;
        }

        throw err;
      }

      return Some(result.unwrap());
    },

    /**
     * Registers a new user.
     * @param user The user data to create.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created user object or an error.
     */
    async registerCurrentUser(user: UserCreate, accessToken: string): Promise<Result<User, AppError>> {
      const result = await apiClient.post<UserCreate, User>('/users/me', 'register current user', user, accessToken);

      if (result.isErr()) {
        const originalError = result.unwrapErr();

        return Err(
          new AppError(`Failed to register user. Reason: ${originalError.message}`, ErrorCodes.VACMAN_API_ERROR, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }

      return result;
    },

    /**
     * Updates a user by their ID.
     * @param user The user data to update, containing the ID and fields to update.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the updated user object or an error.
     */
    async updateUser(user: UserUpdate, accessToken: string): Promise<Result<User, AppError>> {
      const result = await apiClient.put<UserUpdate, User>(
        `/users/${user.id}`,
        `update user with ID ${user.id}`,
        user,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`User with ID ${user.id} not found.`, ErrorCodes.VACMAN_API_ERROR));
        }
        return Err(error);
      }

      return result;
    },
  };
}
