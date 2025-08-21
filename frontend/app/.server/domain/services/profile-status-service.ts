import type { Result, Option } from 'oxide.ts';

import type { LocalizedProfileStatus, ProfileStatus } from '~/.server/domain/models';
import { getDefaultProfileStatusService } from '~/.server/domain/services/profile-status-service-default';
import { getMockProfileStatusService } from '~/.server/domain/services/profile-status-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type ProfileStatusService = {
  listAll(): Promise<readonly ProfileStatus[]>;
  listAllLocalized(language: Language): Promise<readonly LocalizedProfileStatus[]>;
  getById(id: number): Promise<Result<ProfileStatus, AppError>>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedProfileStatus, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedProfileStatus>>;
};

export function getProfileStatusService(): ProfileStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockProfileStatusService() : getDefaultProfileStatusService();
}
