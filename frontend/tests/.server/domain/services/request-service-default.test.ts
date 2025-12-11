import { Ok, Err } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RequestReadModel, RequestUpdateModel, PagedRequestResponse } from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultRequestService } from '~/.server/domain/services/request-service-default';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

vi.mock('~/.server/domain/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

const defaultRequestService = getDefaultRequestService();

describe('RequestServiceDefault', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRequests', () => {
    const mockResponse: PagedRequestResponse = {
      content: [
        {
          id: 1,
          positionNumber: '123456',
          englishTitle: 'Test Request',
          frenchTitle: 'Demande de Test',
          languageRequirements: [{ id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' }],
          status: { code: 'PENDING', id: 1, nameEn: 'Pending', nameFr: 'En attente' },
        },
      ],
      page: {
        number: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    };

    it('should fetch requests successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = { page: 1, size: 10 };
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequests(params, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/requests?page=1&size=10', 'retrieve paginated requests', accessToken);

      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toHaveLength(1);
        expect(response.page.number).toBe(1);
        expect(response.page.size).toBe(10);
      }
    });

    it('should include query parameters when provided', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const params = { page: 2, size: 20, statusId: ['0'], hrAdvisorId: ['1'] };
      const accessToken = 'valid-token';

      await defaultRequestService.getRequests(params, accessToken);

      expect(mockGet).toHaveBeenCalledWith(
        '/requests?page=2&size=20&hrAdvisorId=1&statusId=0',
        'retrieve paginated requests',
        accessToken,
      );
    });

    it('should propagate HTTP client errors', async () => {
      const httpError = Err(new AppError('HTTP request failed', ErrorCodes.VACMAN_API_ERROR));
      mockGet.mockResolvedValue(httpError);

      const params = { page: 1, size: 10 };
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequests(params, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.VACMAN_API_ERROR);
      }
    });
  });

  describe('getCurrentUserRequests', () => {
    const mockResponse: PagedRequestResponse = {
      content: [
        {
          id: 1,
          positionNumber: '123456',
          englishTitle: 'Test Request',
          frenchTitle: 'Demande de Test',
          languageRequirements: [{ id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' }],
          status: { code: 'APPROVED', id: 2, nameEn: 'Approved', nameFr: 'Approuvé' },
        },
      ],
      page: {
        number: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
    };

    it('should fetch current user requests successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockResponse));

      const accessToken = 'user-token';

      const result = await defaultRequestService.getCurrentUserRequests({}, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith('/requests/me', 'retrieve current user requests', accessToken);

      if (result.isOk()) {
        const response = result.unwrap();
        expect(response.content).toHaveLength(1);
        expect(response.content[0]?.id).toBe(1);
        expect(response.content[0]?.englishTitle).toBe('Test Request');
        expect(response.content[0]?.frenchTitle).toBe('Demande de Test');
        expect(response.content[0]?.languageRequirements).toHaveLength(1);
        expect(response.content[0]?.languageRequirements?.[0]).toEqual({
          id: 1,
          code: 'BNI',
          nameEn: 'Bilingual Non-imperative',
          nameFr: 'Bilingue non-impérative',
        });
      }
    });

    it('should propagate HTTP client errors', async () => {
      const httpError = Err(new AppError('Unauthorized access', ErrorCodes.ACCESS_FORBIDDEN));
      mockGet.mockResolvedValue(httpError);

      const accessToken = 'invalid-token';

      const result = await defaultRequestService.getCurrentUserRequests({}, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.ACCESS_FORBIDDEN);
      }
    });
  });

  describe('createRequest', () => {
    const mockRequest: RequestReadModel = {
      id: 123,
      positionNumber: '123456',
      englishTitle: 'Test Request',
      frenchTitle: 'Demande de Test',
      languageRequirements: [{ id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' }],
      status: { code: 'INCOMPLETE', id: 3, nameEn: 'Incomplete', nameFr: 'Incomplet' },
    };

    it('should create a new request successfully', async () => {
      mockPost.mockResolvedValue(Ok(mockRequest));

      const accessToken = 'valid-token';

      const result = await defaultRequestService.createRequest(accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockPost).toHaveBeenCalledWith('/requests/me', 'create new request', {}, accessToken);

      if (result.isOk()) {
        const request = result.unwrap();
        expect(request.id).toBe(123);
        expect(request.status?.code).toBe('INCOMPLETE');
      }
    });

    it('should propagate creation errors', async () => {
      const creationError = Err(new AppError('Request creation failed', ErrorCodes.REQUEST_CREATE_FAILED));
      mockPost.mockResolvedValue(creationError);

      const accessToken = 'valid-token';

      const result = await defaultRequestService.createRequest(accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.REQUEST_CREATE_FAILED);
      }
    });
  });

  describe('getRequestById', () => {
    const mockRequest: RequestReadModel = {
      id: 42,
      positionNumber: '123456',
      englishTitle: 'Test Request',
      frenchTitle: 'Demande de Test',
      languageRequirements: [{ id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' }],
      status: { code: 'PENDING', id: 1, nameEn: 'Pending', nameFr: 'En attente' },
    };

    it('should fetch request by ID successfully', async () => {
      mockGet.mockResolvedValue(Ok(mockRequest));

      const requestId = 42;
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequestById(requestId, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(`/requests/${requestId}`, `retrieve request with ID ${requestId}`, accessToken);

      if (result.isOk()) {
        const request = result.unwrap();
        expect(request.id).toBe(42);
        expect(request.status?.code).toBe('PENDING');
      }
    });

    it('should handle request not found', async () => {
      const notFoundError = Err(new AppError('Request not found', ErrorCodes.REQUEST_NOT_FOUND, { httpStatusCode: 404 }));
      mockGet.mockResolvedValue(notFoundError);

      const requestId = 999;
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequestById(requestId, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.REQUEST_NOT_FOUND);
      }
    });
  });

  describe('updateRequestById', () => {
    const mockUpdatedRequest: RequestReadModel = {
      id: 42,
      positionNumber: '123456',
      englishTitle: 'Test Request',
      frenchTitle: 'Demande de Test',
      languageRequirements: [{ id: 1, code: 'BNI', nameEn: 'Bilingual Non-imperative', nameFr: 'Bilingue non-impérative' }],
      status: { code: 'APPROVED', id: 2, nameEn: 'Approved', nameFr: 'Approuvé' },
    };

    it('should update request successfully', async () => {
      mockPut.mockResolvedValue(Ok(mockUpdatedRequest));

      const requestId = 42;
      const updatedRequest: RequestUpdateModel = {
        englishTitle: 'Test Request',
        frenchTitle: 'Demande de Test',
      };
      const accessToken = 'valid-token';

      const result = await defaultRequestService.updateRequestById(requestId, updatedRequest, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockPut).toHaveBeenCalledWith(
        `/requests/${requestId}`,
        `update request with ID ${requestId}`,
        updatedRequest,
        accessToken,
      );

      if (result.isOk()) {
        const request = result.unwrap();
        expect(request.id).toBe(42);
        expect(request.englishTitle).toBe('Test Request');
        expect(request.frenchTitle).toBe('Demande de Test');
      }
    });

    it('should handle update errors', async () => {
      const updateError = Err(new AppError('Update failed', ErrorCodes.REQUEST_UPDATE_FAILED));
      mockPut.mockResolvedValue(updateError);

      const requestId = 42;
      const updatedRequest: RequestUpdateModel = { englishTitle: 'Updated Title' };
      const accessToken = 'valid-token';

      const result = await defaultRequestService.updateRequestById(requestId, updatedRequest, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error = result.unwrapErr();
        expect(error.errorCode).toBe(ErrorCodes.REQUEST_UPDATE_FAILED);
      }
    });
  });

  describe('getRequestMatchById', () => {
    it('should fetch a specific match successfully', async () => {
      const mockMatch = { id: 1, score: 99 };
      mockGet.mockResolvedValue(Ok(mockMatch));

      const requestId = 42;
      const matchId = 1;
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequestMatchById(requestId, matchId, accessToken);

      expect(result.isOk()).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(
        `/requests/${requestId}/matches/${matchId}`,
        `retrieve match ${matchId} for request ID ${requestId}`,
        accessToken,
      );
    });

    it('should handle match not found', async () => {
      const error = Err(new AppError('Match not found', ErrorCodes.MATCH_NOT_FOUND));
      mockGet.mockResolvedValue(error);

      const requestId = 42;
      const matchId = 999;
      const accessToken = 'valid-token';

      const result = await defaultRequestService.getRequestMatchById(requestId, matchId, accessToken);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const err = result.unwrapErr();
        expect(err.errorCode).toBe(ErrorCodes.MATCH_NOT_FOUND);
      }
    });
  });
});
