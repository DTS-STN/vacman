import type { Result, Option } from 'oxide.ts';

import type { WFAStatus, LocalizedWFAStatus } from '~/.server/domain/models';
import { getDefaultWFAStatusService } from '~/.server/domain/services/wfa-status-service-default';
import { getMockWFAStatusService } from '~/.server/domain/services/wfa-status-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type WFAStatusService = {
  listAll(): Promise<readonly WFAStatus[]>;
  getById(id: string): Promise<Result<WFAStatus, AppError>>;
  findById(id: string): Promise<Option<WFAStatus>>;
  getByCode(code: string): Promise<Result<WFAStatus, AppError>>;
  findByCode(code: string): Promise<Option<WFAStatus>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedWFAStatus[]>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedWFAStatus>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedWFAStatus>>;
};

export function getWFAStatuses(): WFAStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockWFAStatusService() : getDefaultWFAStatusService();
}
