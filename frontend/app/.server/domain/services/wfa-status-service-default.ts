import type { LocalizedWFAStatus, WFAStatus } from '~/.server/domain/models';
import { LookupServiceImplementation, standardLocalize } from '~/.server/domain/services/shared/lookup-service-implementation';
import type { WFAStatusService } from '~/.server/domain/services/wfa-status-service';
import { ErrorCodes } from '~/errors/error-codes';

/*
// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<WFAStatus>('/codes/wfa-statuses', 'wfa status', ErrorCodes.NO_WFA_STATUS_FOUND);

// Create a shared instance of the service (module-level singleton)
export const wfaStatusService: WFAStatusService = sharedService;
*/

class WFAServiceImplementation extends LookupServiceImplementation<WFAStatus, LocalizedWFAStatus> {
  constructor() {
    super({
      apiEndpoint: '/codes/wfa-statuses',
      entityName: 'wfa status',
      notFoundErrorCode: ErrorCodes.NO_WFA_STATUS_FOUND,
      localizeEntity: standardLocalize,
    });
  }

  async listAllLocalized(language: Language): Promise<readonly LocalizedWFAStatus[]> {
    // Get filtered statuses and localize them
    const statuses = await this.listAll();
    return statuses.map((status) => standardLocalize(status, language)).sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Export a single shared instance
export const wfaStatusService: WFAStatusService = new WFAServiceImplementation();

/**
 * Returns the default WFA status service instance.
 */
export function getDefaultWFAStatusService(): WFAStatusService {
  return wfaStatusService;
}
