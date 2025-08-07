import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { NonAdvertisedAppointment } from '~/.server/domain/models';
import { getDefaultNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';
import queryClient from '~/query-client';

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

// Mock global.fetch consistently
const mockFetch = vi.fn();
beforeEach(() => {
  queryClient.clear();
  global.fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockClear();
});

describe('getDefaultNonAdvertisedAppointmentService', () => {
  describe('listAll', () => {
    it('should return a list of non-advertised appointments on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAll();
      expect(result).toEqual(mockAppointmentList);
    });

    it('should throw AppError on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(service.listAll()).rejects.toThrow(AppError);
    });
  });

  describe('getById', () => {
    it('should return an Ok result with a non-advertised appointment if found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.getById(1);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/v1/codes/non-advertised-appointments');
    });

    it('should return an Err result with AppError if not found', async () => {
      const mockDataMissingId = { content: [mockApiData.content[1]] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDataMissingId),
      } as Response);

      const result = await service.getById(1);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().errorCode).toBe(ErrorCodes.NO_NON_ADVERTISED_APPOINTMENT_FOUND);
    });
  });

  describe('findById', () => {
    it('should return Some with a non-advertised appointment if found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.findById(1);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual(singleMockAppointment);
    });

    it('should return None if not found', async () => {
      const mockDataMissingId = { content: [mockApiData.content[1]] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDataMissingId),
      } as Response);
      const result = await service.findById(1);
      expect(result.isNone()).toBe(true);
    });
  });

  describe('listAllLocalized', () => {
    it('should return localized appointments in English', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAllLocalized('en');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return localized appointments in French', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.listAllLocalized('fr');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        code: 'NONE',
        name: 'Sans objet',
      });
    });

    it('should throw AppError on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      await expect(service.listAllLocalized('en')).rejects.toThrow(AppError);
    });
  });

  describe('getLocalizedById', () => {
    it('should return localized appointment in English', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.getLocalizedById(1, 'en');
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().name).toBe('Not Applicable');
    });
  });

  describe('findLocalizedById', () => {
    it('should return Some with localized appointment if found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.findLocalizedById(1, 'en');
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({
        id: 1,
        code: 'NONE',
        name: 'Not Applicable',
      });
    });

    it('should return None if not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiData),
      } as Response);

      const result = await service.findLocalizedById(25, 'en');
      expect(result.isNone()).toBe(true);
    });
  });
});
