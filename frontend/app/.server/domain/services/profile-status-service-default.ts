import type { ProfileStatus } from '~/.server/domain/models';
import type { ProfileStatusService } from '~/.server/domain/services/profile-status-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<ProfileStatus>(
  '/codes/profile-statuses',
  'profile status',
  ErrorCodes.NO_PROFILE_STATUS_FOUND,
);

// Create a single instance of the service (Singleton)
export const profileStatusService: ProfileStatusService = sharedService;

/**
 * Returns the default profile status service instance.
 */
export function getDefaultProfileStatusService(): ProfileStatusService {
  return profileStatusService;
}
