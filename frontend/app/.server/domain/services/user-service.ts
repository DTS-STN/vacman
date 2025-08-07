import type { IDTokenClaims } from '~/.server/auth/auth-strategies';
import type { User, UserCreate } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type UserService = {
  getUsersByRole(role: string): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  getUserByActiveDirectoryId(activeDirectoryId: string): Promise<User | null>;
  getCurrentUser(accessToken: string): Promise<User>;
  registerCurrentUser(user: UserCreate, accessToken: string, idTokenClaims: IDTokenClaims): Promise<User>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
