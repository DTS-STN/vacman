import { getDefaultRequestService } from '~/.server/domain/services/request-service-default';
import { getMockRequestService } from '~/.server/domain/services/request-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type RequestService = object;

export function getRequestService(): RequestService {
  return serverEnvironment.ENABLE_USER_SERVICES_MOCK ? getMockRequestService() : getDefaultRequestService();
}
