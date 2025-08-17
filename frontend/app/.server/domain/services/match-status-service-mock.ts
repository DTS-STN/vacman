import type { MatchStatus } from '~/.server/domain/models';
import type { MatchStatusService } from '~/.server/domain/services/match-status-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import matchStatusData from '~/.server/resources/matchStatus.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: MatchStatus[] = matchStatusData.content.map((matchStatus) => ({
  id: matchStatus.id,
  code: matchStatus.code,
  nameEn: matchStatus.nameEn,
  nameFr: matchStatus.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<MatchStatus>(mockData, 'match status', ErrorCodes.NO_MATCH_STATUS_FOUND);

export function getMockMatchStatusService(): MatchStatusService {
  return {
    listAll(): Promise<readonly MatchStatus[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    listAllLocalized(language: Language) {
      return Promise.resolve(sharedService.listAllLocalized(language));
    },

    getLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.getLocalizedById(id, language));
    },

    findLocalizedById(id: number, language: Language) {
      return Promise.resolve(sharedService.findLocalizedById(id, language));
    },
  };
}
