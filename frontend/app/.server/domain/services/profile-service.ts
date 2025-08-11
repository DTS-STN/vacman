import type { Option, Result } from 'oxide.ts';

import type { Profile, ProfileStatus } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { ProfileStatusCode } from '~/domain/constants';
import type { AppError } from '~/errors/app-error';

/**
 * Parameters for fetching a list of profiles with filtering and data inclusion options.
 */
export interface ListProfilesParams {
  /** The access token for authorization. */
  accessToken: string;

  /**
   * Filters profiles by their active status.
   * - `true`: For "In Progress", "Pending Approval", "Approved".
   * - `false`: For "Archived".
   * - `null` or `undefined`: Do not filter by active status (return all).
   */
  active?: boolean | null;

  /**
   * Filters profiles by the assigned HR advisor.
   * - A user ID string: For a specific advisor.
   * - `"me"`: For the currently logged-in advisor.
   * - `null` or `undefined`: Do not filter by advisor.
   */
  hrAdvisorId?: string | null;

  /**
   * Determines whether to include extended user data (names, email) in the response.
   * - `true`: Include user data.
   * - `false`: Do not include user data.
   */
  includeUserData: boolean;
}

// The expected API response structure
export type ProfileApiResponse = {
  content: readonly (Profile | null | undefined)[];
};

export type ProfileService = {
  registerProfile(accessToken: string): Promise<Result<Profile, AppError>>;
  updateProfileById(accessToken: string, data: Profile): Promise<Result<Profile, AppError>>;
  updateProfileStatus(
    accessToken: string,
    profileId: string,
    profileStatusCode: ProfileStatusCode,
  ): Promise<Result<ProfileStatus, AppError>>;
  findAllProfiles(params: ListProfilesParams): Promise<Option<readonly Profile[]>>;
  listAllProfiles(params: ListProfilesParams): Promise<readonly Profile[]>;
  getCurrentUserProfile(accessToken: string): Promise<Option<Profile>>;
  getProfileById(accessToken: string, profileId: number): Promise<Result<Profile, AppError>>;
  findProfileById(accessToken: string, profileId: number): Promise<Option<Profile>>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
