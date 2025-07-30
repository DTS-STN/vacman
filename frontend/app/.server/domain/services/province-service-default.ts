import type { Province } from '~/.server/domain/models';
import type { ProvinceService } from '~/.server/domain/services/province-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<Province>('/codes/provinces', 'province', ErrorCodes.NO_PROVINCE_FOUND);

// Create a single instance of the service (Singleton)
export const provinceService: ProvinceService = sharedService;

/**
 * Returns the default province service instance.
 */
export function getDefaultProvinceService(): ProvinceService {
  return provinceService;
}
