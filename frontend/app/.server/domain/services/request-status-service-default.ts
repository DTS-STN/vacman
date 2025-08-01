import type { RequestStatus } from '~/.server/domain/models';
import type { RequestStatusService } from '~/.server/domain/services/request-status-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<RequestStatus>(
  '/codes/request-statuses',
  'request status',
  ErrorCodes.NO_REQUEST_STATUS_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const requestStatusService: RequestStatusService = sharedService;

/**
 * Returns the default request status service instance.
 */
export function getDefaultRequestStatusService(): RequestStatusService {
  return requestStatusService;
}
