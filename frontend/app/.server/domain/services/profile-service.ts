import type { Option, Result } from 'oxide.ts';

import type {
  Profile,
  ProfilePutModel,
  ProfileStatusUpdate,
  PagedProfileResponse,
  CollectionProfileResponse,
  ProfileQueryParams,
} from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProfileService = {
  // GET /api/v1/profiles - Get profiles with pagination and filtering
  getProfiles(params: ProfileQueryParams, accessToken: string): Promise<Result<PagedProfileResponse, AppError>>;
  // GET /api/v1/profiles/me - Get profiles for current user
  getCurrentUserProfiles(
    params: Pick<ProfileQueryParams, 'active'>,
    accessToken: string,
  ): Promise<Result<CollectionProfileResponse, AppError>>;
  // GET /api/v1/profiles/me - Find current user's active profile (singular)
  findCurrentUserProfile(params: Pick<ProfileQueryParams, 'active'>, accessToken: string): Promise<Profile>;
  // POST /api/v1/profiles/me - Create a new profile for current user
  registerProfile(accessToken: string): Promise<Result<Profile, AppError>>;
  // GET /api/v1/profiles/{id} - Get a profile by ID
  getProfileById(profileId: number, accessToken: string): Promise<Result<Profile, AppError>>;
  // PUT /api/v1/profiles/{id} - Update an existing profile
  updateProfileById(profileId: number, profile: ProfilePutModel, accessToken: string): Promise<Result<Profile, AppError>>;
  // PUT /api/v1/profiles/{id}/status - Update profile status
  updateProfileStatus(
    profileId: number,
    statusUpdate: ProfileStatusUpdate,
    accessToken: string,
  ): Promise<Result<void, AppError>>;
  // Optional method for finding profile by ID
  findProfileById(profileId: number, accessToken: string): Promise<Option<Profile>>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
