import type { User, UserCreate } from '~/.server/domain/models';
import { getDefaultUserService } from '~/.server/domain/services/user-service-default';
import { getMockUserService } from '~/.server/domain/services/user-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

export type UserService = {
  getUsersByRole(role: string): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  getUserByActiveDirectoryId(activeDirectoryId: string): Promise<User | null>;
  registerUser(user: UserCreate, session: AuthenticatedSession): Promise<User>;
  updateUserRole(activeDirectoryId: string, newRole: string, session: AuthenticatedSession): Promise<User>;
  updatePrivacyConsent(
    activeDirectoryId: string,
    privacyConsentAccepted: boolean,
    session: AuthenticatedSession,
  ): Promise<User>;
};

export function getUserService(): UserService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockUserService() : getDefaultUserService();
}
