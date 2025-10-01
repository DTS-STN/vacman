import type { Option, Result } from 'oxide.ts';
import { Err, None, Ok, Some } from 'oxide.ts';

import type { PagedUserResponse, Profile, User, UserCreate, UserQueryParams, UserUpdate } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { UserService } from '~/.server/domain/services/user-service';
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

export function getDefaultUserService(): UserService {
  return {
    /**
     * Retrieves a paginated list of users with optional filtering.
     * @param params Query parameters for pagination and filtering.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the paginated user response or an error.
     */
    async getUsers(params: UserQueryParams, accessToken: string): Promise<Result<PagedUserResponse, AppError>> {
      log.info('Fetching paginated users');
      log.debug('User search params', {
        page: params.page,
        size: params.size,
        userType: params.userType,
        sort: params.sort,
        hasEmailFilter: Boolean(params.email),
      });
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params.userType) searchParams.append('userType', params.userType);
      if (params.email) searchParams.append('email', params.email);
      if (params.sort) {
        params.sort.forEach((sortParam) => searchParams.append('sort', sortParam));
      }

      const url = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedUserResponse>(url, 'retrieve paginated users', accessToken);

      if (result.isErr()) {
        log.error('Failed to fetch paginated users', result.unwrapErr());
        return Err(result.unwrapErr());
      }
      const page = result.unwrap();
      log.info('Fetched users page', { size: page.page.size, number: page.page.number, total: page.page.totalElements });
      return Ok(page);
    },

    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the user object or an error.
     */
    async getUserById(id: number, accessToken: string): Promise<Result<User, AppError>> {
      log.info('Fetching user by id', { id });
      const result = await apiClient.get<User>(`/users/${id}`, `retrieve user with ID ${id}`, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('User not found', { id });
          return Err(new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR));
        }
        log.error('Failed to fetch user by id', error);
        return Err(error);
      }
      log.info('Fetched user by id successfully', { id });
      return Ok(result.unwrap());
    },

    /**
     * Finds a user by their ID.
     * @param id The ID of the user to retrieve.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the user object if found, or None.
     */
    async findUserById(id: number, accessToken: string): Promise<Option<User>> {
      log.debug('Finding user by id', { id });
      const result = await this.getUserById(id, accessToken);
      return result.ok();
    },

    /**
     * Retrieves the current user.
     * @param accessToken The access token for authorization.
     * @returns An Option containing the user object if found, or None.
     */
    async getCurrentUser(accessToken: string): Promise<Option<User>> {
      log.info('Fetching current user');
      const result = await apiClient.get<User>('/users/me', 'get current user', accessToken);

      if (result.isErr()) {
        const err = result.unwrapErr();

        if (err.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Current user not found');
          return None;
        }

        log.error('Failed to fetch current user', err);
        throw err;
      }
      log.info('Fetched current user successfully');
      return Some(result.unwrap());
    },

    /**
     * Registers a new user from the auth token.
     * @param user The user data to create.
     * @param accessToken The access token for authorization.
     * @returns A Result containing the created user object or an error.
     */
    async registerCurrentUser(user: UserCreate, accessToken: string): Promise<Result<User, AppError>> {
      log.info('Registering current user');
      const result = await apiClient.post<UserCreate, User>('/users/me', 'register current user', user, accessToken);

      if (result.isErr()) {
        const originalError = result.unwrapErr();

        log.error('Failed to register current user', originalError);
        return Err(
          new AppError(`Failed to register user. Reason: ${originalError.message}`, ErrorCodes.VACMAN_API_ERROR, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }
      log.info('Current user registered successfully');
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
      log.info('Updating user', { id });
      const result = await apiClient.put<UserUpdate, User>(`/users/${id}`, `update user with ID ${id}`, user, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        // Check if it's a 404 error and provide a more specific message
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('User not found while updating', { id });
          return Err(new AppError(`User with ID ${id} not found.`, ErrorCodes.VACMAN_API_ERROR));
        }
        log.error('Failed to update user', error);
        return Err(error);
      }
      log.info('User updated successfully', { id });
      return result;
    },

    /**
     * Creates a new profile for a user
     * @param userId The ID of the user to create a profile for
     * @param accessToken The access token for authorization
     * @returns A Result containing the created profile or an error
     */
    async createProfileForUser(userId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      log.info('Creating profile for user', { userId });
      const result = await apiClient.post<null, Profile>(
        `/users/${userId}/profiles`,
        `create profile for user with ID ${userId}`,
        null,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();

        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('User not found while creating profile', { userId });
          return Err(new AppError(`User with ID ${userId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
        }

        if (error.httpStatusCode === HttpStatusCodes.CONFLICT) {
          log.warn('Active profile already exists for user', { userId });
          return Err(new AppError(`User already has an active profile.`, ErrorCodes.ACTIVE_PROFILE_ALREADY_EXISTS));
        }

        log.error('Failed to create profile for user', error);
        return Err(
          new AppError(`Failed to create profile. Reason: ${error.message}`, ErrorCodes.PROFILE_CREATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Profile created for user successfully', { userId });
      return result;
    },
  };
}
