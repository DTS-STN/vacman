import type { NonAdvertisedAppointment } from '~/.server/domain/models';
import type { NonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { createLookupService } from '~/.server/domain/services/shared/lookup-service-helpers';
import { ErrorCodes } from '~/errors/error-codes';

// Create the service using the shared implementation
const service = createLookupService<NonAdvertisedAppointment>(
  '/codes/non-advertised-appointments',
  'non-advertised appointment',
  ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND,
);

// Create a single instance of the service (Singleton)
export const nonAdvertisedAppointmentService: NonAdvertisedAppointmentService = service;

export function getDefaultNonAdvertisedAppointmentService(): NonAdvertisedAppointmentService {
  return nonAdvertisedAppointmentService;
}
