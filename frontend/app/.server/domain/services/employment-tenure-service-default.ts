import type { EmploymentTenure } from '~/.server/domain/models';
import type { EmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<EmploymentTenure>(
  '/codes/employment-tenures',
  'employment tenure',
  ErrorCodes.NO_EMPLOYMENT_TENURE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const employmentTenureService: EmploymentTenureService = sharedService;

/**
 * Returns the default employment tenure service instance.
 */
export function getDefaultEmploymentTenureService(): EmploymentTenureService {
  return employmentTenureService;
}
