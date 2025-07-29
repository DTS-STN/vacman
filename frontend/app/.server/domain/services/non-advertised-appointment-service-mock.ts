import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { NonAdvertisedAppointment, LocalizedNonAdvertisedAppointment } from '~/.server/domain/models';
import type { NonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import nonAdvertisedAppointmentData from '~/.server/resources/nonAdvertisedAppointment.json';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function getMockNonAdvertisedAppointmentService(): NonAdvertisedAppointmentService {
  return {
    listAll: () => Promise.resolve(listAll()),
    getById: (id: string) => Promise.resolve(getById(id)),
    findById: (id: string) => Promise.resolve(findById(id)),
    getByCode: (code: string) => Promise.resolve(getByCode(code)),
    findByCode: (code: string) => Promise.resolve(findByCode(code)),
    listAllLocalized: (language: Language) => Promise.resolve(listAllLocalized(language)),
    getLocalizedById: (id: string, language: Language) => Promise.resolve(getLocalizedById(id, language)),
    findLocalizedById: (id: string, language: Language) => Promise.resolve(findLocalizedById(id, language)),
    getLocalizedByCode: (code: string, language: Language) => Promise.resolve(getLocalizedByCode(code, language)),
    findLocalizedByCode: (code: string, language: Language) => Promise.resolve(findLocalizedByCode(code, language)),
  };
}

/**
 * Retrieves a list of all non-advertised appointments.
 *
 * @returns A promise that resolves to an array of non-advertised appointment objects. The array will be empty if none are found.
 * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
 */
function listAll(): NonAdvertisedAppointment[] {
  const appointments: NonAdvertisedAppointment[] = nonAdvertisedAppointmentData.content.map((appointment) => ({
    id: appointment.id.toString(),
    code: appointment.code,
    nameEn: appointment.nameEn,
    nameFr: appointment.nameFr,
  }));
  return appointments;
}

/**
 * Retrieves a single non-advertised appointment by its ID.
 *
 * @param id The ID of the non-advertised appointment to retrieve.
 * @returns The non-advertised appointment object if found or {AppError} If the non-advertised appointment is not found.
 */
function getById(id: string): Result<NonAdvertisedAppointment, AppError> {
  const result = listAll();
  const nonAdvertisedAppointment = result.find((p) => p.id === id);

  return nonAdvertisedAppointment
    ? Ok(nonAdvertisedAppointment)
    : Err(
        new AppError(`Non-Advertised Appointment with ID '${id}' not found.`, ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND),
      );
}

/**
 * Retrieves a single non-advertised appointment by its ID.
 *
 * @param id The ID of the non-advertised appointment to retrieve.
 * @returns The non-advertised appointment object if found or undefined if not found.
 */
function findById(id: string): Option<NonAdvertisedAppointment> {
  const result = getById(id);
  return result.ok();
}

/**
 * Retrieves a single non-advertised appointment by its CODE.
 *
 * @param code The CODE of the non-advertised appointment to retrieve.
 * @returns The non-advertised appointment object if found or {AppError} If the non-advertised appointment is not found.
 */
function getByCode(code: string): Result<NonAdvertisedAppointment, AppError> {
  const result = listAll();
  const nonAdvertisedAppointment = result.find((p) => p.code === code);

  return nonAdvertisedAppointment
    ? Ok(nonAdvertisedAppointment)
    : Err(
        new AppError(
          `Non-Advertised Appointment with CODE '${code}' not found.`,
          ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND,
        ),
      );
}

/**
 * Retrieves a single non-advertised appointment by its CODE.
 *
 * @param code The CODE of the non-advertised appointment to retrieve.
 * @returns The non-advertised appointment object if found or undefined if not found.
 */
function findByCode(code: string): Option<NonAdvertisedAppointment> {
  const result = getByCode(code);
  return result.ok();
}

/**
 * Retrieves a list of all non-advertised appointments, localized to the specified language.
 *
 * @param language The language for localization.
 * @returns A promise that resolves to an array of localized non-advertised appointment objects.
 * @throws {AppError} if the API call fails for any reason.
 */
function listAllLocalized(language: Language): LocalizedNonAdvertisedAppointment[] {
  return listAll().map((nonAdvertisedAppointment) => ({
    id: nonAdvertisedAppointment.id,
    code: nonAdvertisedAppointment.code,
    name: language === 'fr' ? nonAdvertisedAppointment.nameFr : nonAdvertisedAppointment.nameEn,
  }));
}

/**
 * Retrieves a single localized non-advertised appointment by its ID.
 *
 * @param id The ID of the non-advertised appointment to retrieve.
 * @param language The language to localize the appointment name to.
 * @returns The localized non-advertised appointment object if found or {AppError} If the non-advertised appointment is not found.
 */
function getLocalizedById(id: string, language: Language): Result<LocalizedNonAdvertisedAppointment, AppError> {
  const result = getById(id);
  return result.map((nonAdvertisedAppointment) => ({
    id: nonAdvertisedAppointment.id,
    code: nonAdvertisedAppointment.code,
    name: language === 'fr' ? nonAdvertisedAppointment.nameFr : nonAdvertisedAppointment.nameEn,
  }));
}

/**
 * Retrieves a single localized non-advertised appointment by its ID.
 *
 * @param id The ID of the non-advertised appointment to retrieve.
 * @param language The language to localize the appointment name to.
 * @returns The localized non-advertised appointment object if found or undefined if not found.
 */
function findLocalizedById(id: string, language: Language): Option<LocalizedNonAdvertisedAppointment> {
  const result = getLocalizedById(id, language);
  return result.ok();
}

/**
 * Retrieves a single localized non-advertised appointment by its CODE.
 *
 * @param code The CODE of the non-advertised appointment to retrieve.
 * @param language The language to localize the appointment name to.
 * @returns The localized non-advertised appointment object if found or {AppError} If the non-advertised appointment is not found.
 */
function getLocalizedByCode(code: string, language: Language): Result<LocalizedNonAdvertisedAppointment, AppError> {
  const result = getByCode(code);
  return result.map((nonAdvertisedAppointment) => ({
    id: nonAdvertisedAppointment.id,
    code: nonAdvertisedAppointment.code,
    name: language === 'fr' ? nonAdvertisedAppointment.nameFr : nonAdvertisedAppointment.nameEn,
  }));
}

/**
 * Retrieves a single localized non-advertised appointment by its CODE.
 *
 * @param code The CODE of the non-advertised appointment to retrieve.
 * @param language The language to localize the appointment name to.
 * @returns The localized non-advertised appointment object if found or undefined if not found.
 */
function findLocalizedByCode(code: string, language: Language): Option<LocalizedNonAdvertisedAppointment> {
  const result = getLocalizedByCode(code, language);
  return result.ok();
}
