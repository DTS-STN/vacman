import type { EmploymentOpportunityType } from '~/.server/domain/models';
import type { EmploymentOpportunityTypeService } from '~/.server/domain/services/employment-opportunity-type-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<EmploymentOpportunityType>(
  '/codes/employment-opportunity-types',
  'employment opportunity type',
  ErrorCodes.NO_EMPLOYMENT_OPPORTUNITY_TYPE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const employmentOpportunityTypeService: EmploymentOpportunityTypeService = sharedService;

/**
 * Returns the default employment opportunity type service instance.
 */
export function getDefaultEmploymentOpportunityTypeService(): EmploymentOpportunityTypeService {
  return employmentOpportunityTypeService;
}
