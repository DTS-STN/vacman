import type { WFAStatus } from '~/.server/domain/models';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<WFAStatus>('/codes/wfa-statuses', 'wfa status', ErrorCodes.NO_WFA_STATUS_FOUND);

// Create a shared instance of the service (module-level singleton)
export const wfaStatusService: WFAStatusService = sharedService;

/**
 * Returns the default WFA status service instance.
 */
export function getDefaultWFAStatusService(): WFAStatusService {
  return wfaStatusService;
}
