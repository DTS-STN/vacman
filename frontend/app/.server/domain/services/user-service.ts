import type { User, UserCreate, UserUpdate } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type UserService = {
  getUsersByRole(role: string, accessToken?: string): Promise<User[]>;
  getUserById(id: number, accessToken: string): Promise<User>;
  getCurrentUser(accessToken: string): Promise<User>;
  registerCurrentUser(user: UserCreate, accessToken: string): Promise<User>;
  updateUser(user: UserUpdate, accessToken: string): Promise<User>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
