import type { NonAdvertisedAppointment } from '~/.server/domain/models';
import type { NonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { createMockLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import nonAdvertisedAppointmentData from '~/.server/resources/nonAdvertisedAppointment.json';
import { ErrorCodes } from '~/errors/error-codes';

// Transform the JSON data to match our entity interface
const mockData: NonAdvertisedAppointment[] = nonAdvertisedAppointmentData.content.map((appointment) => ({
  id: appointment.id,
  code: appointment.code,
  nameEn: appointment.nameEn,
  nameFr: appointment.nameFr,
}));

// Create the service using the shared implementation
const mockService = createMockLookupService<NonAdvertisedAppointment>(
  mockData,
  'Non-Advertised Appointment',
  ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND,
);

export function getMockNonAdvertisedAppointmentService(): NonAdvertisedAppointmentService {
  return {
    listAll: () => Promise.resolve(mockService.listAll()),
    getById: (id: number) => Promise.resolve(mockService.getById(id)),
    findById: (id: number) => Promise.resolve(mockService.findById(id)),
    getByCode: (code: string) => Promise.resolve(mockService.getByCode(code)),
    findByCode: (code: string) => Promise.resolve(mockService.findByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(mockService.listAllLocalized(language)),
    getLocalizedById: (id: number, language: Language) => Promise.resolve(mockService.getLocalizedById(id, language)),
    findLocalizedById: (id: number, language: Language) => Promise.resolve(mockService.findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(mockService.getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(mockService.findLocalizedByCode(code, language)),
  };
}
