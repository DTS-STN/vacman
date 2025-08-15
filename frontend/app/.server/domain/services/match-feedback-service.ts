import type { Result, Option } from 'oxide.ts';

import type { MatchFeedback, LocalizedMatchFeedback } from '~/.server/domain/models';
import { getDefaultMatchFeedbackService } from '~/.server/domain/services/match-feedback-service-default';
import { getMockMatchFeedbackService } from '~/.server/domain/services/match-feedback-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type MatchFeedbackService = {
  listAll(): Promise<readonly MatchFeedback[]>;
  getById(id: number): Promise<Result<MatchFeedback, AppError>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedMatchFeedback[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedMatchFeedback, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedMatchFeedback>>;
};

export function getMatchFeedbackService(): MatchFeedbackService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockMatchFeedbackService() : getDefaultMatchFeedbackService();
}
