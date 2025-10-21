import { describe, expect, it, beforeEach, vi } from 'vitest';

import type { RequestService } from '~/.server/domain/services/request-service';
import { ErrorCodes } from '~/errors/error-codes';

describe('RequestServiceMock', () => {
  let requestService: RequestService;

  beforeEach(async () => {
    vi.resetModules();
    const { getMockRequestService } = await import('~/.server/domain/services/request-service-mock');
    requestService = getMockRequestService();

    const requestResult = await getMockRequestService().createRequest('mock-user');
    if (requestResult.isOk()) {
      const request = requestResult.unwrap();
      await requestService.updateRequestById(
        request.id,
        {
          englishTitle: 'Software Developer',
          frenchTitle: 'Développeur de logiciels',
          classificationId: 0,
          languageRequirementId: 0,
          securityClearanceId: 0,
          englishLanguageProfile: 'CBC',
          frenchLanguageProfile: 'CBC',
        },
        'mock-user',
      );
    }
  });

  describe('getRequests', () => {
    it('should return paginated requests successfully', async () => {
      const params = { page: 1, size: 2 };
      const accessToken = 'valid-token';

      const result = await requestService.getRequests(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toBeInstanceOf(Array);
        expect(response.page).toBeDefined();
        expect(response.page.number).toBe(1);
        expect(response.page.size).toBe(2);
        expect(response.page.totalElements).toBeGreaterThanOrEqual(0);
        expect(response.page.totalPages).toBeGreaterThanOrEqual(0);
      }
    });

    it('should filter by status when specified', async () => {
      const params = { status: 'SUBMIT' };
      const accessToken = 'valid-token';

      const result = await requestService.getRequests(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        response.content.forEach((request) => {
          expect(request.status?.code.toLowerCase()).toBe('submit');
        });
      }
    });

    it('should handle empty results', async () => {
      const params = { status: 'NON_EXISTENT_STATUS' };
      const accessToken = 'valid-token';

      const result = await requestService.getRequests(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toEqual([]);
        expect(response.page.totalElements).toBe(0);
      }
    });

    it('should apply pagination correctly', async () => {
      const params = { page: 0, size: 1 };
      const accessToken = 'valid-token';

      const result = await requestService.getRequests(params, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.page.number).toBe(0);
        expect(response.page.size).toBe(1);
        expect(response.content.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('createRequest', () => {
    it('should create a new request successfully', async () => {
      const accessToken = 'new-user';

      const result = await requestService.createRequest(accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const request = result.unwrap();
        expect(request).toHaveProperty('id');
      }
    });
  });

  describe('getRequestById', () => {
    it('should return request when found', async () => {
      const requestId = 1;
      const accessToken = 'valid-token';

      const result = await requestService.getRequestById(requestId, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const request = result.unwrap();
        expect(request.id).toBe(requestId);
      }
    });

    it('should return error when request not found', async () => {
      const requestId = 99999;
      const accessToken = 'valid-token';

      const result = await requestService.getRequestById(requestId, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.REQUEST_NOT_FOUND);
      }
    });
  });

  describe('updateRequestById', () => {
    it('should update request successfully', async () => {
      const requestId = 1;
      const update = {
        englishTitle: 'Updated Title',
        frenchTitle: 'Titre Mis à Jour',
        englishLanguageProfile: 'BBB',
        frenchLanguageProfile: 'BBB',
        classificationId: requestId,
        languageRequirementId: requestId,
        securityClearanceId: requestId,
      };
      const accessToken = 'valid-token';

      const result = await requestService.updateRequestById(requestId, update, accessToken);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const updatedRequest = result.unwrap();
        expect(updatedRequest.id).toBe(requestId);
        expect(updatedRequest.englishTitle).toBe('Updated Title');
        expect(updatedRequest.frenchTitle).toBe('Titre Mis à Jour');
        expect(updatedRequest.englishLanguageProfile).toBe('BBB');
        expect(updatedRequest.frenchLanguageProfile).toBe('BBB');
        expect(updatedRequest.classification).toEqual({ id: 1, code: 'AS-02', nameEn: 'AS-02', nameFr: 'AS-02' });
        expect(updatedRequest.languageRequirement).toEqual({
          id: 1,
          code: 'BNI',
          nameEn: 'Bilingual Non-imperative',
          nameFr: 'Bilingue non-impérative',
        });
        expect(updatedRequest.securityClearance).toEqual({
          id: 1,
          code: 'ER-FA',
          nameEn: 'Enhanced Reliability',
          nameFr: 'Fiabilité approfondie',
        });
      }
    });

    it('should return error when request not found', async () => {
      const requestId = 99999;
      const update = {
        classification: { id: 0, code: 'AS-01', nameEn: 'AS-01', nameFr: 'AS-01' },
        englishTitle: 'Updated Title',
        frenchTitle: 'Titre Mis à Jour',
        languageRequirement: { id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' },
        securityClearance: { id: 3, code: 'ES-SA', nameEn: 'Enhanced Secret', nameFr: 'Secret avec fiabilité approfondie' },
      };
      const accessToken = 'valid-token';

      const result = await requestService.updateRequestById(requestId, update, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.REQUEST_NOT_FOUND);
      }
    });
  });

  describe('findRequestById', () => {
    it('should return Some when request exists', async () => {
      const requestId = 1;
      const accessToken = 'valid-token';

      const result = await requestService.findRequestById(requestId, accessToken);

      expect(result.isSome()).toBe(true);
      if (result.isSome()) {
        const request = result.unwrap();
        expect(request.id).toBe(requestId);
      }
    });

    it('should return None when request does not exist', async () => {
      const requestId = 99999;
      const accessToken = 'valid-token';

      const result = await requestService.findRequestById(requestId, accessToken);

      expect(result.isNone()).toBe(true);
    });
  });
});
