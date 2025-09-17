import { Err, Ok } from 'oxide.ts';
import type { Option, Result } from 'oxide.ts';

import type {
  RequestReadModel,
  RequestUpdateModel,
  PagedRequestResponse,
  CollectionRequestResponse,
  RequestQueryParams,
  PagedProfileResponse,
} from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { RequestService } from '~/.server/domain/services/request-service';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

export function getDefaultRequestService(): RequestService {
  return {
    /**
     * Retrieves a paginated list of requests with optional filtering.
     */
    async getRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>> {
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.classification) searchParams.append('classification', params.classification);
      if (params.province) searchParams.append('province', params.province);
      if (params.sort) params.sort.forEach((sort) => searchParams.append('sort', sort));

      const url = `/requests${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedRequestResponse>(url, 'retrieve paginated requests', accessToken);

      if (result.isErr()) {
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());
    },

    /**
     * Retrieves requests for the current user.
     */
    async getCurrentUserRequests(accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      const result = await apiClient.get<CollectionRequestResponse>(
        '/requests/me',
        'retrieve current user requests',
        accessToken,
      );

      if (result.isErr()) {
        return Err(result.unwrapErr());
      }

      return Ok(result.unwrap());
    },

    /**
     * Creates a new request for the current user.
     */
    async createRequest(accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.post<Record<string, never>, RequestReadModel>(
        '/requests/me',
        'create new request',
        {},
        accessToken,
      );

      if (result.isErr()) {
        const originalError = result.unwrapErr();
        return Err(
          new AppError(`Failed to create request. Reason: ${originalError.message}`, ErrorCodes.REQUEST_CREATE_FAILED, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }

      return result;
    },

    /**
     * Retrieves a request by its ID.
     */
    async getRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.get<RequestReadModel>(
        `/requests/${requestId}`,
        `retrieve request with ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Updates a request by its ID.
     */
    async updateRequestById(
      requestId: number,
      request: RequestUpdateModel,
      accessToken: string,
    ): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.put<RequestUpdateModel, RequestReadModel>(
        `/requests/${requestId}`,
        `update request with ID ${requestId}`,
        request,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update request. Reason: ${error.message}`, ErrorCodes.REQUEST_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return result;
    },

    /**
     * Updates a request's status.
     */
    async updateRequestStatus(requestId: number, eventType: string, accessToken: string): Promise<Result<void, AppError>> {
      const result = await apiClient.put<unknown, undefined>(
        `/requests/${requestId}/status`,
        `update request status for ID ${requestId}`,
        eventType,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update request status. Reason: ${error.message}`, ErrorCodes.REQUEST_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return Ok(undefined);
    },

    /**
     * Deletes a request by its ID.
     */
    async deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>> {
      const result = await apiClient.delete(`/requests/${requestId}`, `delete request with ID ${requestId}`, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to delete request. Reason: ${error.message}`, ErrorCodes.REQUEST_DELETE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return Ok(undefined);
    },

    /**
     * Gets all matches for a request.
     */
    async getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      const result = await apiClient.get<CollectionRequestResponse>(
        `/requests/${requestId}/matches`,
        `retrieve matches for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Gets a specific match for a request.
     */
    async getRequestMatchById(requestId: number, matchId: number, accessToken: string): Promise<Result<unknown, AppError>> {
      const result = await apiClient.get<unknown>(
        `/requests/${requestId}/matches/${matchId}`,
        `retrieve match ${matchId} for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Updates a request match status.
     */
    async updateRequestMatchStatus(
      requestId: number,
      matchId: number,
      statusUpdate: unknown,
      accessToken: string,
    ): Promise<Result<void, AppError>> {
      const result = await apiClient.put<unknown, undefined>(
        `/requests/${requestId}/matches/${matchId}/status`,
        `update match status for match ${matchId} and request ID ${requestId}`,
        statusUpdate,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update match status. Reason: ${error.message}`, ErrorCodes.MATCH_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return Ok(undefined);
    },

    /**
     * Gets candidate profiles for a request.
     */
    async getRequestProfiles(requestId: number, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      const result = await apiClient.get<PagedProfileResponse>(
        `/requests/${requestId}/profiles`,
        `retrieve profiles for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Finds a request by its ID.
     */
    async findRequestById(requestId: number, accessToken: string): Promise<Option<RequestReadModel>> {
      const result = await this.getRequestById(requestId, accessToken);
      return result.ok();
    },
  };
}
