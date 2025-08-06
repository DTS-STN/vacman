import type { Result, Option } from 'oxide.ts';

import type { WorkSchedule, LocalizedWorkSchedule } from '~/.server/domain/models';
import { getDefaultWorkScheduleService } from '~/.server/domain/services/work-schedule-service-default';
import { getMockWorkScheduleService } from '~/.server/domain/services/work-schedule-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type WorkScheduleService = {
  listAll(): Promise<readonly WorkSchedule[]>;
  getById(id: number): Promise<Result<WorkSchedule, AppError>>;
  findById(id: number): Promise<Option<WorkSchedule>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedWorkSchedule[]>;
  getLocalizedById(id: number, language: Language): Promise<Result<LocalizedWorkSchedule, AppError>>;
  findLocalizedById(id: number, language: Language): Promise<Option<LocalizedWorkSchedule>>;
};

export function getWorkScheduleService(): WorkScheduleService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK ? getMockWorkScheduleService() : getDefaultWorkScheduleService();
}
