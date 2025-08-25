import type { MatchStatus } from '~/.server/domain/models';
import type { MatchStatusService } from '~/.server/domain/services/match-status-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<MatchStatus>('/codes/match-status', 'match-status', ErrorCodes.NO_MATCH_STATUS_FOUND);

// Create a shared instance of the service (module-level singleton)
export const matchStatusService: MatchStatusService = sharedService;

/**
 * Returns the default match status service instance.
 */
export function getDefaultMatchStatusService(): MatchStatusService {
  return matchStatusService;
}
