import type { Result, Option } from 'oxide.ts';

import type { WFAStatus, LocalizedWFAStatus } from '~/.server/domain/models';
import { getDefaultWFAStatusService } from '~/.server/domain/services/wfa-status-service-default';
import { getMockWFAStatusService } from '~/.server/domain/services/wfa-status-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type WFAStatusService = {
  getAll(): Promise<Result<readonly WFAStatus[], AppError>>;
  getById(id: string): Promise<Result<WFAStatus, AppError>>;
  findById(id: string): Promise<Option<WFAStatus>>;
  getAllLocalized(language: Language): Promise<Result<readonly LocalizedWFAStatus[], AppError>>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedWFAStatus, AppError>>;
};

export function getWFAStatuses(): WFAStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockWFAStatusService() : getDefaultWFAStatusService();
}
