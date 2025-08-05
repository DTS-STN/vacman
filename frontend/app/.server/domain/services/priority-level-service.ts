import type { Result, Option } from 'oxide.ts';

import type { PriorityLevel, LocalizedPriorityLevel } from '~/.server/domain/models';
import { getDefaultPriorityLevelService } from '~/.server/domain/services/priority-level-service-default';
import { getMockPriorityLevelService } from '~/.server/domain/services/priority-level-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type PriorityLevelService = {
  listAll(): Promise<readonly PriorityLevel[]>;
  getById(id: number): Promise<Result<PriorityLevel, AppError>>;
  findById(id: number): Promise<Option<PriorityLevel>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedPriorityLevel[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedPriorityLevel, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedPriorityLevel>>;
};

export function getPriorityLevelService(): PriorityLevelService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockPriorityLevelService() : getDefaultPriorityLevelService();
}
