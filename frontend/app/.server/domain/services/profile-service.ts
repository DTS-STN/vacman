import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AuthenticatedSession } from '~/.server/utils/auth-utils';

export type ProfileService = {
  getProfile(activeDirectoryId: string): Promise<Profile | null>;
  registerProfile(activeDirectoryId: string, session: AuthenticatedSession): Promise<Profile>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
