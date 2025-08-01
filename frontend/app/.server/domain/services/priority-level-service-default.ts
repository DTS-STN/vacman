import type { PriorityLevel } from '~/.server/domain/models';
import type { PriorityLevelService } from '~/.server/domain/services/priority-level-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<PriorityLevel>(
  '/codes/priority-levels',
  'priority level',
  ErrorCodes.NO_PRIORITY_LEVEL_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const priorityLevelService: PriorityLevelService = sharedService;

/**
 * Returns the default priority level service instance.
 */
export function getDefaultPriorityLevelService(): PriorityLevelService {
  return priorityLevelService;
}
