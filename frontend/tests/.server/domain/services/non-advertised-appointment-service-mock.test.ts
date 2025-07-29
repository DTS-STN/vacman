import { describe, it, expect } from 'vitest';

import { getMockNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service-mock';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

const service = getMockNonAdvertisedAppointmentService();

describe('getMockNonAdvertisedAppointmentService', () => {
  describe('listAll', () => {
    it('should return all mock non-advertised appointments data', async () => {
      const result = await service.listAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Verify structure of returned appointments
      const firstAppointment = result[0];
      expect(firstAppointment).toBeDefined();
      expect(firstAppointment).toHaveProperty('id');
      expect(firstAppointment).toHaveProperty('code');
      expect(firstAppointment).toHaveProperty('nameEn');
      expect(firstAppointment).toHaveProperty('nameFr');
    });

    it('should return consistent data on multiple calls', async () => {
      const result1 = await service.listAll();
      const result2 = await service.listAll();
      expect(result1).toEqual(result2);
    });
  });

  describe('getById', () => {
    it('should return a non-advertised appointment by ID', async () => {
      const all = await service.listAll();
      expect(all.length).toBeGreaterThan(0);

      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getById(first.id);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().id).toBe(first.id);
      expect(result.unwrap().code).toBe(first.code);
      expect(result.unwrap().nameEn).toBe(first.nameEn);
      expect(result.unwrap().nameFr).toBe(first.nameFr);
    });

    it('should return error if appointment ID not found', async () => {
      const result = await service.getById('non-existent-id');
      expect(result.isErr()).toBe(true);

      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(err.msg).toContain('not found');
    });

    it('should handle string ID conversion correctly', async () => {
      // Test with the first appointment which should have ID "1"
      const result = await service.getById('1');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().id).toBe('1');
    });
  });

  describe('getByCode', () => {
    it('should return a non-advertised appointment by code', async () => {
      const all = await service.listAll();
      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getByCode(first.code);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().code).toBe(first.code);
      expect(result.unwrap().id).toBe(first.id);
    });

    it('should return error if appointment code not found', async () => {
      const result = await service.getByCode('NON_EXISTENT_CODE');
      expect(result.isErr()).toBe(true);

      const err = result.unwrapErr();
      expect(err).toBeInstanceOf(AppError);
      expect(err.errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(err.msg).toContain('not found');
    });

    it('should work with known codes from test data', async () => {
      // Test with "NONE" which should be in the test data
      const result = await service.getByCode('NONE');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().code).toBe('NONE');
    });
  });

  describe('findById', () => {
    it('should find a non-advertised appointment by ID using Option', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.findById(first.id);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap().id).toBe(first.id);
    });

    it('should return None if appointment ID not found', async () => {
      const result = await service.findById('non-existent-id');
      expect(result.isNone()).toBe(true);
    });
  });

  describe('findByCode', () => {
    it('should find a non-advertised appointment by code using Option', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.findByCode(first.code);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap().code).toBe(first.code);
    });

    it('should return None if appointment code not found', async () => {
      const result = await service.findByCode('NON_EXISTENT_CODE');
      expect(result.isNone()).toBe(true);
    });
  });

  describe('listAllLocalized', () => {
    it('should return localized appointments in English', async () => {
      const result = await service.listAllLocalized('en');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const firstLocalized = result[0];
      expect(firstLocalized).toBeDefined();
      expect(firstLocalized).toHaveProperty('id');
      expect(firstLocalized).toHaveProperty('code');
      expect(firstLocalized).toHaveProperty('name');

      // Verify English localization
      const allAppointments = await service.listAll();
      const firstOriginal = allAppointments[0];
      if (firstOriginal) {
        expect(firstLocalized?.name).toBe(firstOriginal.nameEn);
      }
    });

    it('should return localized appointments in French', async () => {
      const result = await service.listAllLocalized('fr');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const firstLocalized = result[0];
      expect(firstLocalized).toBeDefined();

      // Verify French localization
      const allAppointments = await service.listAll();
      const firstOriginal = allAppointments[0];
      if (firstOriginal) {
        expect(firstLocalized?.name).toBe(firstOriginal.nameFr);
      }
    });

    it('should return same number of items as listAll', async () => {
      const all = await service.listAll();
      const localizedEn = await service.listAllLocalized('en');
      const localizedFr = await service.listAllLocalized('fr');

      expect(localizedEn.length).toBe(all.length);
      expect(localizedFr.length).toBe(all.length);
    });
  });

  describe('getLocalizedById', () => {
    it('should return localized appointment by ID in English', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getLocalizedById(first.id, 'en');
      expect(result.isOk()).toBe(true);

      const localized = result.unwrap();
      expect(localized.id).toBe(first.id);
      expect(localized.code).toBe(first.code);
      expect(localized.name).toBe(first.nameEn);
    });

    it('should return localized appointment by ID in French', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getLocalizedById(first.id, 'fr');
      expect(result.isOk()).toBe(true);

      const localized = result.unwrap();
      expect(localized.id).toBe(first.id);
      expect(localized.code).toBe(first.code);
      expect(localized.name).toBe(first.nameFr);
    });

    it('should return error if appointment ID not found', async () => {
      const result = await service.getLocalizedById('non-existent-id', 'en');
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('getLocalizedByCode', () => {
    it('should return localized appointment by code in English', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getLocalizedByCode(first.code, 'en');
      expect(result.isOk()).toBe(true);

      const localized = result.unwrap();
      expect(localized.code).toBe(first.code);
      expect(localized.name).toBe(first.nameEn);
    });

    it('should return localized appointment by code in French', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.getLocalizedByCode(first.code, 'fr');
      expect(result.isOk()).toBe(true);

      const localized = result.unwrap();
      expect(localized.code).toBe(first.code);
      expect(localized.name).toBe(first.nameFr);
    });

    it('should return error if appointment code not found', async () => {
      const result = await service.getLocalizedByCode('NON_EXISTENT_CODE', 'en');
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('findLocalizedById', () => {
    it('should find localized appointment by ID using Option', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.findLocalizedById(first.id, 'en');
      expect(result.isSome()).toBe(true);

      const localized = result.unwrap();
      expect(localized.id).toBe(first.id);
      expect(localized.name).toBe(first.nameEn);
    });

    it('should return None if appointment ID not found', async () => {
      const result = await service.findLocalizedById('non-existent-id', 'en');
      expect(result.isNone()).toBe(true);
    });

    it('should handle both English and French localization', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const resultEn = await service.findLocalizedById(first.id, 'en');
      const resultFr = await service.findLocalizedById(first.id, 'fr');

      expect(resultEn.isSome()).toBe(true);
      expect(resultFr.isSome()).toBe(true);
      expect(resultEn.unwrap().name).toBe(first.nameEn);
      expect(resultFr.unwrap().name).toBe(first.nameFr);
    });
  });

  describe('findLocalizedByCode', () => {
    it('should find localized appointment by code using Option', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const result = await service.findLocalizedByCode(first.code, 'en');
      expect(result.isSome()).toBe(true);

      const localized = result.unwrap();
      expect(localized.code).toBe(first.code);
      expect(localized.name).toBe(first.nameEn);
    });

    it('should return None if appointment code not found', async () => {
      const result = await service.findLocalizedByCode('NON_EXISTENT_CODE', 'en');
      expect(result.isNone()).toBe(true);
    });

    it('should handle both English and French localization', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const resultEn = await service.findLocalizedByCode(first.code, 'en');
      const resultFr = await service.findLocalizedByCode(first.code, 'fr');

      expect(resultEn.isSome()).toBe(true);
      expect(resultFr.isSome()).toBe(true);
      expect(resultEn.unwrap().name).toBe(first.nameEn);
      expect(resultFr.unwrap().name).toBe(first.nameFr);
    });
  });

  describe('error handling consistency', () => {
    it('should use consistent error codes for not found scenarios', async () => {
      const getByIdError = await service.getById('non-existent-id');
      const getByCodeError = await service.getByCode('NON_EXISTENT_CODE');
      const getLocalizedByIdError = await service.getLocalizedById('non-existent-id', 'en');
      const getLocalizedByCodeError = await service.getLocalizedByCode('NON_EXISTENT_CODE', 'en');

      expect(getByIdError.isErr()).toBe(true);
      expect(getByCodeError.isErr()).toBe(true);
      expect(getLocalizedByIdError.isErr()).toBe(true);
      expect(getLocalizedByCodeError.isErr()).toBe(true);

      // All should use the same error code
      expect(getByIdError.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(getByCodeError.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(getLocalizedByIdError.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(getLocalizedByCodeError.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('data integrity', () => {
    it('should maintain data consistency across different methods', async () => {
      const all = await service.listAll();
      const first = all[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      // Get the same appointment through different methods
      const byId = await service.getById(first.id);
      const byCode = await service.getByCode(first.code);

      expect(byId.isOk()).toBe(true);
      expect(byCode.isOk()).toBe(true);
      expect(byId.unwrap()).toEqual(byCode.unwrap());
      expect(byId.unwrap()).toEqual(first);
    });

    it('should maintain localization consistency', async () => {
      const appointments = await service.listAll();
      const first = appointments[0];
      if (!first) {
        throw new Error('Expected at least one appointment in the list');
      }

      const localizedById = await service.getLocalizedById(first.id, 'en');
      const localizedByCode = await service.getLocalizedByCode(first.code, 'en');

      expect(localizedById.isOk()).toBe(true);
      expect(localizedByCode.isOk()).toBe(true);
      expect(localizedById.unwrap()).toEqual(localizedByCode.unwrap());
    });
  });
});
