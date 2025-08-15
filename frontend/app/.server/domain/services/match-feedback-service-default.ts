import type { MatchFeedback } from '~/.server/domain/models';
import type { MatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<MatchFeedback>(
  '/codes/match-feedback',
  'match-feedback',
  ErrorCodes.NO_MATCH_FEEDBACK_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const matchFeedbackService: MatchFeedbackService = sharedService;

/**
 * Returns the default match feedback service instance.
 */
export function getDefaultMatchFeedbackService(): MatchFeedbackService {
  return matchFeedbackService;
}
