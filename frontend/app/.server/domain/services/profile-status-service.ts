import { getDefaultProfileStatusService } from './profile-status-service-default';
import { getMockProfileStatusService } from './profile-status-service-mock';

import type { LocalizedStatus, ProfileStatus } from '~/.server/domain/models';
import { serverEnvironment } from '~/.server/environment';

export type ProfileStatusService = {
  listAll(): Promise<readonly ProfileStatus[]>;
  listAllLocalized(language: Language): Promise<readonly LocalizedStatus[]>;
};

export function getProfileStatusService(): ProfileStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProfileStatusService() : getDefaultProfileStatusService();
}
