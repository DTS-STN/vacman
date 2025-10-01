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
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { HttpStatusCodes } from '~/errors/http-status-codes';

const log = LogFactory.getLogger(import.meta.url);

export function getDefaultRequestService(): RequestService {
  return {
    /**
     * Retrieves a paginated list of requests with optional filtering.
     */
    async getRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>> {
      log.info('Fetching paginated requests');
      log.debug('Request search params', {
        page: params.page,
        size: params.size,
        status: params.status,
        classification: params.classification,
        province: params.province,
        sort: params.sort,
      });
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
        log.error('Failed to fetch paginated requests', result.unwrapErr());
        return Err(result.unwrapErr());
      }
      const page = result.unwrap();
      log.info('Fetched requests page', { size: page.page.size, number: page.page.number, total: page.page.totalElements });
      return Ok(page);
    },

    /**
     * Retrieves requests for the current user.
     */
    async getCurrentUserRequests(accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      log.info('Fetching current user requests');
      const result = await apiClient.get<CollectionRequestResponse>(
        '/requests/me',
        'retrieve current user requests',
        accessToken,
      );

      if (result.isErr()) {
        log.error('Failed to fetch current user requests', result.unwrapErr());
        return Err(result.unwrapErr());
      }
      const response = result.unwrap();
      log.info('Fetched current user requests', { count: response.content.length });
      return Ok(result.unwrap());
    },

    /**
     * Creates a new request for the current user.
     */
    async createRequest(accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      log.info('Creating new request for current user');
      const result = await apiClient.post<Record<string, never>, RequestReadModel>(
        '/requests/me',
        'create new request',
        {},
        accessToken,
      );

      if (result.isErr()) {
        const originalError = result.unwrapErr();
        log.error('Failed to create request', originalError);
        return Err(
          new AppError(`Failed to create request. Reason: ${originalError.message}`, ErrorCodes.REQUEST_CREATE_FAILED, {
            httpStatusCode: originalError.httpStatusCode,
            correlationId: originalError.correlationId,
          }),
        );
      }
      log.info('Request created successfully');
      return result;
    },

    /**
     * Retrieves a request by its ID.
     */
    async getRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      log.info('Fetching request by id', { requestId });
      const result = await apiClient.get<RequestReadModel>(
        `/requests/${requestId}`,
        `retrieve request with ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request not found', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to fetch request by id', error);
        return Err(error);
      }
      log.info('Fetched request by id successfully', { requestId });
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
      log.info('Updating request', { requestId });
      const result = await apiClient.put<RequestUpdateModel, RequestReadModel>(
        `/requests/${requestId}`,
        `update request with ID ${requestId}`,
        request,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request not found while updating', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to update request', error);
        return Err(
          new AppError(`Failed to update request. Reason: ${error.message}`, ErrorCodes.REQUEST_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Request updated successfully', { requestId });
      return result;
    },

    /**
     * Updates a request's status.
     */
    async updateRequestStatus(requestId: number, eventType: string, accessToken: string): Promise<Result<void, AppError>> {
      log.info('Updating request status', { requestId, eventType });
      const result = await apiClient.put<unknown, undefined>(
        `/requests/${requestId}/status-change`,
        `update request status for ID ${requestId}`,
        eventType,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request not found while updating status', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to update request status', error);
        return Err(
          new AppError(`Failed to update request status. Reason: ${error.message}`, ErrorCodes.REQUEST_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Request status updated successfully', { requestId });
      return Ok(undefined);
    },

    /**
     * Deletes a request by its ID.
     */
    async deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>> {
      log.info('Deleting request by id', { requestId });
      const result = await apiClient.delete(`/requests/${requestId}`, `delete request with ID ${requestId}`, accessToken);

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request not found while deleting', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to delete request', error);
        return Err(
          new AppError(`Failed to delete request. Reason: ${error.message}`, ErrorCodes.REQUEST_DELETE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Request deleted successfully', { requestId });
      return Ok(undefined);
    },

    /**
     * Gets all matches for a request.
     */
    async getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      log.info('Fetching request matches', { requestId });
      const result = await apiClient.get<CollectionRequestResponse>(
        `/requests/${requestId}/matches`,
        `retrieve matches for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request or matches not found', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to fetch request matches', error);
        return Err(error);
      }
      const response = result.unwrap();
      log.info('Fetched request matches', { count: response.content.length, requestId });
      return Ok(result.unwrap());
    },

    /**
     * Gets a specific match for a request.
     */
    async getRequestMatchById(requestId: number, matchId: number, accessToken: string): Promise<Result<unknown, AppError>> {
      log.info('Fetching request match by id', { requestId, matchId });
      const result = await apiClient.get<unknown>(
        `/requests/${requestId}/matches/${matchId}`,
        `retrieve match ${matchId} for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request match not found', { requestId, matchId });
          return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
        }
        log.error('Failed to fetch request match by id', error);
        return Err(error);
      }
      log.info('Fetched request match by id successfully', { requestId, matchId });
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
      log.info('Updating request match status', { requestId, matchId });
      const result = await apiClient.put<unknown, undefined>(
        `/requests/${requestId}/matches/${matchId}/status`,
        `update match status for match ${matchId} and request ID ${requestId}`,
        statusUpdate,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request match not found while updating status', { requestId, matchId });
          return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
        }
        log.error('Failed to update request match status', error);
        return Err(
          new AppError(`Failed to update match status. Reason: ${error.message}`, ErrorCodes.MATCH_STATUS_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }
      log.info('Request match status updated successfully', { requestId, matchId });
      return Ok(undefined);
    },

    /**
     * Gets candidate profiles for a request.
     */
    async getRequestProfiles(requestId: number, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      log.info('Fetching request profiles', { requestId });
      const result = await apiClient.get<PagedProfileResponse>(
        `/requests/${requestId}/profiles`,
        `retrieve profiles for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          log.warn('Request not found while fetching profiles', { requestId });
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        log.error('Failed to fetch request profiles', error);
        return Err(error);
      }
      const page = result.unwrap();
      log.info('Fetched request profiles', { size: page.page.size, number: page.page.number, total: page.page.totalElements });
      return Ok(result.unwrap());
    },

    /**
     * Finds a request by its ID.
     */
    async findRequestById(requestId: number, accessToken: string): Promise<Option<RequestReadModel>> {
      log.debug('Finding request by id', { requestId });
      const result = await this.getRequestById(requestId, accessToken);
      return result.ok();
    },
  };
}
