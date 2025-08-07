import type { SelectionProcessType } from '~/.server/domain/models';
import type { SelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<SelectionProcessType>(
  '/codes/selection-process-types',
  'selection process type',
  ErrorCodes.NO_SELECTION_PROCESS_TYPE_FOUND,
);

// Create a shared instance of the service (module-level singleton)
export const selectionProcessTypeService: SelectionProcessTypeService = sharedService;

/**
 * Returns the default selection process type service instance.
 */
export function getDefaultSelectionProcessTypeService(): SelectionProcessTypeService {
  return selectionProcessTypeService;
}
