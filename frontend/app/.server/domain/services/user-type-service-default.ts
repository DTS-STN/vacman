import type { UserType } from '~/.server/domain/models';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { UserTypeService } from '~/.server/domain/services/user-type-service';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<UserType>('/codes/user-types', 'user type', ErrorCodes.NO_USER_TYPE_FOUND);

// Create a shared instance of the service (module-level singleton)
export const userTypeService: UserTypeService = sharedService;

/**
 * Returns the default user type service instance.
 */
export function getDefaultUserTypeService(): UserTypeService {
  return userTypeService;
}
