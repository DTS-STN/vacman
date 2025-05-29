import type { CurrentWFAStatus, LocalizedCurrentWFAStatus } from '~/.server/domain/models';
import { getDefaultCurrentWFAStatusService } from '~/.server/domain/services/current-wfa-status-service-default';
import { getMockCurrentWFAStatusService } from '~/.server/domain/services/current-wfa-status-service-mock';
import { serverEnvironment } from '~/.server/environment';

export type CurrentWFAStatusService = {
  getCurrentWFAStatuses(): Promise<readonly CurrentWFAStatus[]>;
  getCurrentWFAStatusById(id: string): Promise<CurrentWFAStatus | undefined>;
  getLocalizedCurrentWFAStatuses(language: Language): Promise<readonly LocalizedCurrentWFAStatus[]>;
  getLocalizedCurrentWFAStatusById(id: string, language: Language): Promise<LocalizedCurrentWFAStatus | undefined>;
};

export function getCurrentWFAStatuses(): CurrentWFAStatusService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockCurrentWFAStatusService()
    : getDefaultCurrentWFAStatusService();
}
