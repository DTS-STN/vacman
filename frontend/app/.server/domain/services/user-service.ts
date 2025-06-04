import type { User, UserCreate } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type UserService = {
  getUserById(id: string): Promise<User>;
  registerUser(user: UserCreate): Promise<User>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
