import type { Option, Result } from 'oxide.ts';

import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProfileService = {
  getProfile(activeDirectoryId: string): Promise<Option<Profile>>;
  registerProfile(accessToken: string): Promise<Profile>;
  updateProfile(accessToken: string, profileId: string, userUpdated: string, data: Profile): Promise<Result<void, AppError>>;
  submitProfileForReview(activeDirectoryId: string): Promise<Result<Profile, AppError>>;
  getAllProfiles(): Promise<Profile[]>;
  getCurrentUserProfile(accessToken: string): Promise<Option<Profile>>;
  getProfileById(accessToken: string, profileId: string): Promise<Option<Profile>>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
