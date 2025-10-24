import { Err, Ok } from 'oxide.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '~/.server/domain/services/api-client';
import { getDefaultRequestService } from '~/.server/domain/services/request-service-default';
import { MATCH_STATUS_CODE } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

// Mock the apiClient
vi.mock('~/.server/domain/services/api-client');
const mockApiClient = vi.mocked(apiClient);

describe('RequestService - updateRequestMatchStatus', () => {
  const requestService = getDefaultRequestService();
  const mockAccessToken = 'mock-access-token';
  const requestId = 123;
  const matchId = 456;
  const statusUpdate = { statusCode: MATCH_STATUS_CODE.approved };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update match status', async () => {
    // Arrange
    mockApiClient.post.mockResolvedValueOnce(Ok(undefined));

    // Act
    const result = await requestService.updateRequestMatchStatus(requestId, matchId, statusUpdate, mockAccessToken);

    // Assert
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/requests/${requestId}/matches/${matchId}/status-change`,
      `update match status for match ${matchId} and request ID ${requestId}`,
      statusUpdate,
      mockAccessToken,
    );
  });

  it('should handle 404 error when match not found', async () => {
    // Arrange
    const notFoundError = new AppError('Not found', ErrorCodes.MATCH_NOT_FOUND, {
      httpStatusCode: HttpStatusCodes.NOT_FOUND,
    });
    mockApiClient.post.mockResolvedValueOnce(Err(notFoundError));

    // Act
    const result = await requestService.updateRequestMatchStatus(requestId, matchId, statusUpdate, mockAccessToken);

    // Assert
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.message).toBe(`Match ${matchId} for request ID ${requestId} not found.`);
    expect(error.errorCode).toBe(ErrorCodes.MATCH_NOT_FOUND);
  });

  it('should handle general API errors', async () => {
    // Arrange
    const apiError = new AppError('Server error', ErrorCodes.VACMAN_API_ERROR, {
      httpStatusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    });
    mockApiClient.post.mockResolvedValueOnce(Err(apiError));

    // Act
    const result = await requestService.updateRequestMatchStatus(requestId, matchId, statusUpdate, mockAccessToken);

    // Assert
    expect(result.isErr()).toBe(true);
    const error = result.unwrapErr();
    expect(error.message).toBe('Failed to update match status. Reason: Server error');
    expect(error.errorCode).toBe(ErrorCodes.MATCH_STATUS_UPDATE_FAILED);
  });

  it('should use correct HTTP method and endpoint', async () => {
    // Arrange
    mockApiClient.post.mockResolvedValueOnce(Ok(undefined));

    // Act
    await requestService.updateRequestMatchStatus(requestId, matchId, statusUpdate, mockAccessToken);

    // Assert
    expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockApiClient.post).toHaveBeenCalledWith(
      `/requests/${requestId}/matches/${matchId}/status-change`,
      expect.any(String),
      statusUpdate,
      mockAccessToken,
    );
  });
});
