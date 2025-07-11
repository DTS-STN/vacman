import type { Option } from 'oxide.ts';

import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type ProfileService = {
  getProfile(activeDirectoryId: string): Promise<Option<Profile>>;
  registerProfile(activeDirectoryId: string): Promise<Profile>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
