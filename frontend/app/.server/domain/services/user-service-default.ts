import { Err, None, Ok, Some } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate, PagedUserResponse, UserQueryParams } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { UserService } from '~/.server/domain/services/user-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultUserService(): UserService {
  return {
    /**
     * Retrieves a paginated list of users with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated user response or an error.
     */
    async getUsers(params: UserQueryParams, accessToken: string): Promise<Result<PagedUserResponse, AppError>> {
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params['user-type']) searchParams.append('user-type', params['user-type']);
      if (params.sort) {
        params.sort.forEach((sortParam) => searchParams.append('sort', sortParam));
      }

      const url = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedUserResponse>(url, 'retrieve paginated users', accessToken);

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
     * Registers a new user from the auth token.
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
     * Updates a user by their ID using PUT endpoint.
     * @param id The ID of the user to update.
     * @param user The user data to update.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the updated user object or an error.
     */
    async updateUserById(id: number, user: UserUpdate, accessToken: string): Promise<Result<User, AppError>> {
      const result = await apiClient.put<UserUpdate, User>(`/users/${id}`, `update user with ID ${id}`, user, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR));
        }
        return Err(error);
      }

      return result;
    },

    /**
     * Retrieves a user by their business email address using POST /users/find-or-create.
     * This endpoint will find an existing user or create a new one if the email is associated
     * with an existing Microsoft Entra user.
     * @param email The email address of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the user object or an error.
     */
    async getUserByEmail(email: string, accessToken: string): Promise<Result<User, AppError>> {
      try {
        const result = await apiClient.post<{ businessEmail: string }, User>(
          '/users/find-or-create',
          `find or create user with email ${email}`,
          { businessEmail: email },
          accessToken,
        );

        if (result.isErr()) {
          const error = result.unwrapErr();
          // Check if it's a 404 error and provide a more specific message
          if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
            return Err(new AppError(`User with email ${email} not found.`, ErrorCodes.VACMAN_API_ERROR));
          }
          return Err(error);
        }

        return Ok(result.unwrap());
      } catch {
        return Err(new AppError(`Failed to retrieve user with email ${email}`, ErrorCodes.VACMAN_API_ERROR));
      }
    },
  };
}
