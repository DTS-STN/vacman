import type { Classification } from '~/.server/domain/models';
import type { ClassificationService } from '~/.server/domain/services/classification-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createLookupService<Classification>(
  '/codes/classifications',
  'classification',
  ErrorCodes.NO_CLASSIFICATION_FOUND,
);

// Create a single instance of the service (Singleton)
export const classificationService: ClassificationService = sharedService;

/**
 * Returns the default classification service instance.
 */
export function getDefaultClassificationService(): ClassificationService {
  return classificationService;
}
