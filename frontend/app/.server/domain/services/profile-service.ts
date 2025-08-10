import type { Option, Result } from 'oxide.ts';

import type { Profile } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProfileService = {
  registerProfile(accessToken: string): Promise<Result<Profile, AppError>>;
  updateProfile(accessToken: string, profileId: number, userUpdated: string, data: Profile): Promise<Result<void, AppError>>;
  submitProfileForReview(accessToken: string): Promise<Result<Profile, AppError>>;
  getAllProfiles(): Promise<Profile[]>;
  getCurrentUserProfile(accessToken: string): Promise<Option<Profile>>;
  getProfileById(accessToken: string, profileId: number): Promise<Result<Profile, AppError>>;
  findProfileById(accessToken: string, profileId: number): Promise<Option<Profile>>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
