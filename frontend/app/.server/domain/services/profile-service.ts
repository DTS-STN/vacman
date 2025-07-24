import type { Option, Result } from 'oxide.ts';

import type { Profile, UserEmploymentInformation, UserReferralPreferences } from '~/.server/domain/models';
import { getDefaultProfileService } from '~/.server/domain/services/profile-service-default';
import { getMockProfileService } from '~/.server/domain/services/profile-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProfileService = {
  getProfile(activeDirectoryId: string): Promise<Option<Profile>>;
  registerProfile(activeDirectoryId: string): Promise<Profile>;
  updateEmploymentInformation(
    activeDirectoryId: string,
    employmentInfo: UserEmploymentInformation,
  ): Promise<Result<void, AppError>>;
  updateReferralPreferences(activeDirectoryId: string, referralPrefs: UserReferralPreferences): Promise<Result<void, AppError>>;
  getAllProfiles(): Promise<Profile[]>;
};

export function getProfileService(): ProfileService {
  return serverEnvironment.ENABLE_PROFILE_SERVICES_MOCK ? getMockProfileService() : getDefaultProfileService();
}
