import type { Result, Option } from 'oxide.ts';

import type { RequestStatus, LocalizedRequestStatus } from '~/.server/domain/models';
import { getDefaultRequestStatusService } from '~/.server/domain/services/request-status-service-default';
import { getMockRequestStatusService } from '~/.server/domain/services/request-status-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type RequestStatusService = {
  listAll(): Promise<readonly RequestStatus[]>;
  getById(id: number): Promise<Result<RequestStatus, AppError>>;
  findById(id: number): Promise<Option<RequestStatus>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedRequestStatus[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedRequestStatus, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedRequestStatus>>;
};

export function getRequestStatusService(): RequestStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockRequestStatusService() : getDefaultRequestStatusService();
}
