import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate, PagedUserResponse, UserQueryParams } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type UserService = {
  // GET /api/v1/users - Get users with pagination and filtering
  getUsers(params: UserQueryParams, accessToken: string): Promise<Result<PagedUserResponse, AppError>>;
  // GET /api/v1/users/{id} - Get a user by ID
  getUserById(id: number, accessToken: string): Promise<Result<User, AppError>>;
  // Optional method for finding user by ID
  findUserById(id: number, accessToken: string): Promise<Option<User>>;
  // GET /api/v1/users/me - Get the current user
  getCurrentUser(accessToken: string): Promise<Option<User>>;
  // POST /api/v1/users/me - Create a new user from auth token
  registerCurrentUser(user: UserCreate, accessToken: string): Promise<Result<User, AppError>>;
  // PUT /api/v1/users/{id} - Update an existing user (full update)
  updateUserById(id: number, user: UserUpdate, accessToken: string): Promise<Result<User, AppError>>;
  // POST /api/v1/users/find-or-create - Find user by email or create if associated with Entra ID
  getUserByEmail(email: string, accessToken: string): Promise<Result<User, AppError>>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
