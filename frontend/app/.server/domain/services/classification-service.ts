import type { Result, Option } from 'oxide.ts';

import type { Classification } from '~/.server/domain/models';
import { getDefaultClassificationService } from '~/.server/domain/services/classification-service-default';
import { getMockClassificationService } from '~/.server/domain/services/classification-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ClassificationService = {
  getAll(): Promise<Result<readonly Classification[], AppError>>;
  getById(id: string): Promise<Result<Classification, AppError>>;
  findById(id: string): Promise<Option<Classification>>;
};

export function getClassificationService(): ClassificationService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockClassificationService()
    : getDefaultClassificationService();
}
