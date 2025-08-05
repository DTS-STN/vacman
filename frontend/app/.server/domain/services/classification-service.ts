import type { Result, Option } from 'oxide.ts';

import type { Classification, LocalizedClassification } from '~/.server/domain/models';
import { getDefaultClassificationService } from '~/.server/domain/services/classification-service-default';
import { getMockClassificationService } from '~/.server/domain/services/classification-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ClassificationService = {
  listAll(): Promise<readonly Classification[]>;
  getById(id: number): Promise<Result<Classification, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedClassification[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedClassification, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedClassification>>;
};

export function getClassificationService(): ClassificationService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockClassificationService()
    : getDefaultClassificationService();
}
