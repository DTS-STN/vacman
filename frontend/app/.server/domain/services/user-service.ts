import type { Option, Result } from 'oxide.ts';

import type { User, UserCreate, UserUpdate } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type UserService = {
  getUsersByRole(role: string, accessToken: string): Promise<Result<User[], AppError>>;
  getUserById(id: number, accessToken: string): Promise<Result<User, AppError>>;
  findUserById(id: number, accessToken: string): Promise<Option<User>>;
  getCurrentUser(accessToken: string): Promise<Option<User>>;
  registerCurrentUser(user: UserCreate, accessToken: string): Promise<Result<User, AppError>>;
  updateUser(user: UserUpdate, accessToken: string): Promise<Result<User, AppError>>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
