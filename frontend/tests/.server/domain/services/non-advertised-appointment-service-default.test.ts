import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { NonAdvertisedAppointment } from '~/.server/domain/models';
import { getDefaultNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock API data that mirrors the structure returned by the API
const mockApiData = {
  content: [
    { id: 1, code: 'NONE', nameEn: 'Not Applicable', nameFr: 'Sans objet' },
    { id: 2, code: 'EXCEPTIONAL_CASE', nameEn: 'Exceptional Case', nameFr: 'Cas exceptionnel' },
    { id: 3, code: 'URGENT_REQUIREMENT', nameEn: 'Urgent Requirement', nameFr: 'Besoin urgent' },
  ],
};

const mockAppointmentList: NonAdvertisedAppointment[] = mockApiData.content;
const singleMockAppointment = mockApiData.content[0];

const service = getDefaultNonAdvertisedAppointmentService();

beforeEach(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe('getDefaultNonAdvertisedAppointmentService', () => {
  describe('listAll', () => {
    it('should return a list of non-advertised appointments on success', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.listAll();
      expect(result).toEqual(mockAppointmentList);
      expect(result.length).toBe(3);
    });

    it('should throw AppError on API failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      await expect(service.listAll()).rejects.toThrow(AppError);
    });
  });

  describe('getById', () => {
    it('should return an Ok result with a non-advertised appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockAppointment),
      });

      const result = await service.getById(1);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
    });

    it('should return an Err result with AppError if not found (404)', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
        statusText: 'Not Found',
      });

      const result = await service.getById(25);
      expect(result.isErr()).toBe(true);

      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(error.msg).toContain('not found');
    });

    it('should return an Err result with AppError on server error (500)', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      const result = await service.getById(1);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(AppError);
    });
  });

  describe('getByCode', () => {
    it('should return an Ok result with a non-advertised appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.getByCode('NONE');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
    });

    it('should return an Err result if code not found (empty response)', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await service.getByCode('NON_EXISTENT_CODE');
      expect(result.isErr()).toBe(true);

      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(AppError);
      expect(error.errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
      expect(error.msg).toContain('not found');
    });

    it('should throw AppError on API failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      await expect(service.getByCode('NONE')).rejects.toThrow(AppError);
    });
  });

  describe('findById', () => {
    it('should return Some with a non-advertised appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockAppointment),
      });

      const result = await service.findById(1);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
    });

    it('should return None if not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
        statusText: 'Not Found',
      });

      const result = await service.findById(25);
      expect(result.isNone()).toBe(true);
    });

    it('should return None on server error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      // findById calls getById which returns Err for server errors, .ok() converts Err to None
      const result = await service.findById(1);
      expect(result.isNone()).toBe(true);
    });
  });

  describe('findByCode', () => {
    it('should return Some with a non-advertised appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.findByCode('NONE');
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
    });

    it('should return None if code not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await service.findByCode('NON_EXISTENT_CODE');
      expect(result.isNone()).toBe(true);
    });

    it('should throw AppError on server error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      await expect(service.findByCode('NONE')).rejects.toThrow(AppError);
    });
  });

  describe('listAllLocalized', () => {
    it('should return localized appointments in English', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.listAllLocalized('en');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return localized appointments in French', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.listAllLocalized('fr');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Sans objet',
      });
    });

    it('should throw AppError on API failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      });

      await expect(service.listAllLocalized('en')).rejects.toThrow(AppError);
    });
  });

  describe('getLocalizedById', () => {
    it('should return localized appointment in English', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockAppointment),
      });

      const result = await service.getLocalizedById(1, 'en');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return localized appointment in French', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockAppointment),
      });

      const result = await service.getLocalizedById(1, 'fr');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Sans objet',
      });
    });

    it('should return Err if appointment not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
        statusText: 'Not Found',
      });

      const result = await service.getLocalizedById(25, 'en');
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('getLocalizedByCode', () => {
    it('should return localized appointment in English', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.getLocalizedByCode('NONE', 'en');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return localized appointment in French', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.getLocalizedByCode('NONE', 'fr');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Sans objet',
      });
    });

    it('should return Err if code not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await service.getLocalizedByCode('NON_EXISTENT_CODE', 'en');
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('findLocalizedById', () => {
    it('should return Some with localized appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(singleMockAppointment),
      });

      const result = await service.findLocalizedById(1, 'en');
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return None if not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.NOT_FOUND,
        statusText: 'Not Found',
      });

      const result = await service.findLocalizedById(25, 'en');
      expect(result.isNone()).toBe(true);
    });
  });

  describe('findLocalizedByCode', () => {
    it('should return Some with localized appointment if found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      });

      const result = await service.findLocalizedByCode('NONE', 'en');
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: '1',
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return None if code not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: [] }),
      });

      const result = await service.findLocalizedByCode('NON_EXISTENT_CODE', 'en');
      expect(result.isNone()).toBe(true);
    });
  });
});
