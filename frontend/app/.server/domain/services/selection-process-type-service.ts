import type { Result, Option } from 'oxide.ts';

import type { SelectionProcessType, LocalizedSelectionProcessType } from '~/.server/domain/models';
import { getDefaultSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service-default';
import { getMockSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type SelectionProcessTypeService = {
  listAll(): Promise<readonly SelectionProcessType[]>;
  getById(id: number): Promise<Result<SelectionProcessType, AppError>>;
  findById(id: number): Promise<Option<SelectionProcessType>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedSelectionProcessType[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedSelectionProcessType, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedSelectionProcessType>>;
};

export function getSelectionProcessTypeService(): SelectionProcessTypeService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockSelectionProcessTypeService()
    : getDefaultSelectionProcessTypeService();
}
