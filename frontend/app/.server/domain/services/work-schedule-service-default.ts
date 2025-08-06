import type { WorkSchedule } from '~/.server/domain/models';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { WorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<WorkSchedule>(
  '/codes/work-schedules',
  'work schedule',
  ErrorCodes.NO_WORK_SCHEDULE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const workScheduleService: WorkScheduleService = sharedService;

/**
 * Returns the default work schedule service instance.
 */
export function getDefaultWorkScheduleService(): WorkScheduleService {
  return workScheduleService;
}
