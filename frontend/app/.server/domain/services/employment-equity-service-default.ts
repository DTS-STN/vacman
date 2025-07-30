import type { EmploymentEquity } from '~/.server/domain/models';
import type { EmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<EmploymentEquity>(
  '/codes/employment-equity',
  'employment equity',
  ErrorCodes.NO_EMPLOYMENT_EQUITY_FOUND,
);

// Create a single instance of the service (Singleton)
export const employmentEquityService: EmploymentEquityService = sharedService;

/**
 * Returns the default employment equity service instance.
 */
export function getDefaultEmploymentEquityService(): EmploymentEquityService {
  return employmentEquityService;
}
