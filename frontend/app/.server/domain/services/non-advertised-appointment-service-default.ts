import type { Result, Option } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type { NonAdvertisedAppointment, LocalizedNonAdvertisedAppointment } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { NonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Centralized localization logic
function localizeNonAdvertisedAppointment(
  nonAdvertisedAppointment: NonAdvertisedAppointment,
  language: Language,
): LocalizedNonAdvertisedAppointment {
  return {
    id: nonAdvertisedAppointment.id,
    code: nonAdvertisedAppointment.code,
    name: language === 'fr' ? nonAdvertisedAppointment.nameFr : nonAdvertisedAppointment.nameEn,
  };
}

// Create a single instance of the service (Singleton)
export const nonAdvertisedAppointmentService: NonAdvertisedAppointmentService = {
  /**
   * Retrieves a list of all non-advertised appointments.
   *
   * @returns A promise that resolves to an array of non-advertised appointment objects. The array will be empty if none are found.
   * @throws {AppError} if the API call fails for any reason (e.g., network error, server error).
   */
  async listAll(): Promise<readonly NonAdvertisedAppointment[]> {
    type ApiResponse = {
      content: readonly NonAdvertisedAppointment[];
    };
    const context = 'list all non-advertised appointments';
    const response = await apiClient.get<ApiResponse>('/codes/non-advertised-appointments', context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }

    const data = response.unwrap();
    return data.content;
  },

  /**
   * Retrieves a single non-advertised appointment by its ID.
   *
   * @param id The ID of the non-advertised appointment to retrieve.
   * @returns A `Result` containing the non-advertised appointment object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getById(id: string): Promise<Result<NonAdvertisedAppointment, AppError>> {
    const context = `Get non-advertised appointment with ID '${id}'`;
    const response = await apiClient.get<NonAdvertisedAppointment>(`/codes/non-advertised-appointments/${id}`, context);

    if (response.isErr()) {
      const apiFetchError = response.unwrapErr();

      if (apiFetchError.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
        return Err(new AppError(`${context} not found.`, ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND));
      }

      // For all other errors (500, parsing, network), just return them as is.
      return Err(apiFetchError);
    }
    return response;
  },

  /**
   * Retrieves a single non-advertised appointment by its CODE.
   *
   * @param code The CODE of the non-advertised appointment to retrieve.
   * @returns A `Result` containing the non-advertised appointment object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getByCode(code: string): Promise<Result<NonAdvertisedAppointment, AppError>> {
    const context = `get non-advertised appointment with CODE '${code}'`;
    type ApiResponse = {
      content: readonly NonAdvertisedAppointment[];
    };
    const response = await apiClient.get<ApiResponse>(`/codes/non-advertised-appointments?code=${code}`, context);

    if (response.isErr()) {
      throw response.unwrapErr();
    }
    const data = response.unwrap();
    const nonAdvertisedAppointment = data.content[0]; // Get the first element from the response array

    if (!nonAdvertisedAppointment) {
      // The request was successful, but no appointment with that code exists.
      return Err(new AppError(`${context} not found.`, ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND));
    }

    return Ok(nonAdvertisedAppointment);
  },

  /**
   * Finds a single non-advertised appointment by its ID.
   *
   * @param id The ID of the non-advertised appointment to find.
   * @returns An `Option` containing the non-advertised appointment object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findById(id: string): Promise<Option<NonAdvertisedAppointment>> {
    const result = await this.getById(id);
    return result.ok(); // .ok() converts Result<T, E> to Option<T>
  },

  /**
   * Finds a single non-advertised appointment by its CODE.
   *
   * @param code The CODE of the non-advertised appointment to find.
   * @returns An `Option` containing the non-advertised appointment object if found, or `None` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findByCode(code: string): Promise<Option<NonAdvertisedAppointment>> {
    const result = await this.getByCode(code);
    return result.ok();
  },

  // Localized methods

  /**
   * Retrieves a list of all non-advertised appointments, localized to the specified language.
   *
   * @param language The language for localization.
   * @returns A promise that resolves to an array of localized non-advertised appointment objects.
   * @throws {AppError} if the API call fails for any reason.
   */
  async listAllLocalized(language: Language): Promise<readonly LocalizedNonAdvertisedAppointment[]> {
    const nonAdvertisedAppointments = await this.listAll();
    return nonAdvertisedAppointments.map((appointment) => localizeNonAdvertisedAppointment(appointment, language));
  },

  /**
   * Retrieves a single localized non-advertised appointment by its ID.
   *
   * @param id The ID of the non-advertised appointment to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized non-advertised appointment object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedById(id: string, language: Language): Promise<Result<LocalizedNonAdvertisedAppointment, AppError>> {
    const result = await this.getById(id);
    return result.map((nonAdvertisedAppointment) => localizeNonAdvertisedAppointment(nonAdvertisedAppointment, language));
  },

  /**
   * Retrieves a single localized non-advertised appointment by its CODE.
   *
   * @param code The CODE of the non-advertised appointment to retrieve.
   * @param language The language for localization.
   * @returns A `Result` containing the localized non-advertised appointment object if found, or an `AppError` if not found.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async getLocalizedByCode(code: string, language: Language): Promise<Result<LocalizedNonAdvertisedAppointment, AppError>> {
    const result = await this.getByCode(code);
    return result.map((nonAdvertisedAppointment) => localizeNonAdvertisedAppointment(nonAdvertisedAppointment, language));
  },

  /**
   * Finds a single localized non-advertised appointment by its ID.
   *
   * @param id The ID of the non-advertised appointment to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized non-advertised appointment object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedById(id: string, language: Language): Promise<Option<LocalizedNonAdvertisedAppointment>> {
    const result = await this.getLocalizedById(id, language);
    return result.ok();
  },

  /**
   * Finds a single localized non-advertised appointment by its CODE.
   *
   * @param code The CODE of the non-advertised appointment to find.
   * @param language The language for localization.
   * @returns An `Option` containing the localized non-advertised appointment object if found, or `None`.
   * @throws {AppError} if the API call fails for any reason other than a 404 not found.
   */
  async findLocalizedByCode(code: string, language: Language): Promise<Option<LocalizedNonAdvertisedAppointment>> {
    const result = await this.getLocalizedByCode(code, language);
    return result.ok();
  },
};

export function getDefaultNonAdvertisedAppointmentService(): NonAdvertisedAppointmentService {
  return nonAdvertisedAppointmentService;
}
