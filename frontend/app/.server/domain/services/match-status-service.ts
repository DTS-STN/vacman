import type { Result, Option } from 'oxide.ts';

import type { MatchStatus, LocalizedMatchStatus } from '~/.server/domain/models';
import { getDefaultMatchStatusService } from '~/.server/domain/services/match-status-service-default';
import { getMockMatchStatusService } from '~/.server/domain/services/match-status-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type MatchStatusService = {
  listAll(): Promise<readonly MatchStatus[]>;
  getById(id: number): Promise<Result<MatchStatus, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedMatchStatus[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedMatchStatus, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedMatchStatus>>;
};

export function getMatchStatusService(): MatchStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockMatchStatusService() : getDefaultMatchStatusService();
}
