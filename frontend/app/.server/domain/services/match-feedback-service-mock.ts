import type { MatchFeedback } from '~/.server/domain/models';
import type { MatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import matchFeedbackData from '~/.server/resources/matchFeedback.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the data to match the expected format
const mockData: MatchFeedback[] = matchFeedbackData.content.map((matchFeedback) => ({
  id: matchFeedback.id,
  code: matchFeedback.code,
  nameEn: matchFeedback.nameEn,
  nameFr: matchFeedback.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<MatchFeedback>(mockData, 'match feedback', ErrorCodes.NO_MATCH_FEEDBACK_FOUND);

export function getMockMatchFeedbackService(): MatchFeedbackService {
  return {
    listAll(): Promise<readonly MatchFeedback[]> {
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
