import type { WorkSchedule, LocalizedWorkSchedule } from '~/.server/domain/models';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import type { WorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import workScheduleData from '~/.server/resources/workSchedule.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match the expected format
const transformedData: WorkSchedule[] = workScheduleData.content.map((item) => ({
  id: item.id,
  code: item.code,
  nameEn: item.nameEn,
  nameFr: item.nameFr,
}));

// Create a single instance of the service using shared implementation with standard localization
const sharedService = createMockLookupService<WorkSchedule>(
  transformedData,
  'work schedule',
  ErrorCodes.NO_WORK_SCHEDULE_FOUND,
);

export function getMockWorkScheduleService(): WorkScheduleService {
  return {
    listAll(): Promise<readonly WorkSchedule[]> {
      return Promise.resolve(sharedService.listAll());
    },

    getById(id: number) {
      return Promise.resolve(sharedService.getById(id));
    },

    findById(id: number) {
      return Promise.resolve(sharedService.findById(id));
    },

    listAllLocalized(language: Language): Promise<readonly LocalizedWorkSchedule[]> {
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
