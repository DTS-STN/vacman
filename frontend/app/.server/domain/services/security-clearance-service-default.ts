import type { SecurityClearance } from '~/.server/domain/models';
import type { SecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<SecurityClearance>(
  '/codes/security-clearances',
  'security clearance',
  ErrorCodes.NO_SECURITY_CLEARANCE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const securityClearanceService: SecurityClearanceService = sharedService;

/**
 * Returns the default security clearance service instance.
 */
export function getDefaultSecurityClearanceService(): SecurityClearanceService {
  return securityClearanceService;
}
