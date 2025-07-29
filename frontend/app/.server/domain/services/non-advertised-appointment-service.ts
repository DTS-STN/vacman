import type { Result, Option } from 'oxide.ts';

import type { NonAdvertisedAppointment, LocalizedNonAdvertisedAppointment } from '~/.server/domain/models';
import { getDefaultNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service-default';
import { getMockNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type NonAdvertisedAppointmentService = {
  listAll(): Promise<readonly NonAdvertisedAppointment[]>;
  getById(id: string): Promise<Result<NonAdvertisedAppointment, AppError>>;
  findById(id: string): Promise<Option<NonAdvertisedAppointment>>;
  getByCode(code: string): Promise<Result<NonAdvertisedAppointment, AppError>>;
  findByCode(code: string): Promise<Option<NonAdvertisedAppointment>>;
  listAllLocalized(language: Language): Promise<readonly LocalizedNonAdvertisedAppointment[]>;
  getLocalizedById(id: string, language: Language): Promise<Result<LocalizedNonAdvertisedAppointment, AppError>>;
  findLocalizedById(id: string, language: Language): Promise<Option<LocalizedNonAdvertisedAppointment>>;
  getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedNonAdvertisedAppointment, AppError>>;
  findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedNonAdvertisedAppointment>>;
};

export function getNonAdvertisedAppointmentService(): NonAdvertisedAppointmentService {
  return serverEnvironment.ENABLE_LOOKUP_FIELD_SERVICES_MOCK
    ? getMockNonAdvertisedAppointmentService()
    : getDefaultNonAdvertisedAppointmentService();
}
