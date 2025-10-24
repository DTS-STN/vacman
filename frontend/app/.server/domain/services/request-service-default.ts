import type { Option, Result } from 'oxide.ts';
import { Err, Ok } from 'oxide.ts';

import type {
  CollectionMatchResponse,
  MatchReadModel,
  MatchStatusUpdate,
  MatchUpdateModel,
  PagedRequestResponse,
  Profile,
  RequestQueryParams,
  RequestReadModel,
  RequestStatusUpdate,
  RequestUpdateModel,
} from '~/.server/domain/models';
import { apiClient } from '~/.server/domain/services/api-client';
import type { RequestService } from '~/.server/domain/services/request-service';
import { MATCH_STATUS_CODE } from '~/domain/constants';
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
      if (params.hrAdvisorId?.length)
        params.hrAdvisorId.forEach((hrAdvisorId) => searchParams.append('hrAdvisorId', hrAdvisorId));
      if (params.statusId?.length) params.statusId.forEach((statusId) => searchParams.append('statusId', statusId));
      if (params.workUnitId?.length) params.workUnitId.forEach((workUnitId) => searchParams.append('workUnitId', workUnitId));
      if (params.sort?.length) params.sort.forEach((sort) => searchParams.append('sort', sort));

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
    async getCurrentUserRequests(
      params: RequestQueryParams,
      accessToken: string,
    ): Promise<Result<PagedRequestResponse, AppError>> {
      const searchParams = new URLSearchParams();

      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
      if (params.sort?.length) params.sort.forEach((sort) => searchParams.append('sort', sort));

      const url = `/requests/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const result = await apiClient.get<PagedRequestResponse>(url, 'retrieve current user requests', accessToken);

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
    async updateRequestStatus(
      requestId: number,
      statusUpdate: RequestStatusUpdate,
      accessToken: string,
    ): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.post<RequestStatusUpdate, RequestReadModel>(
        `/requests/${requestId}/status-change`,
        `update request status for ID ${requestId}`,
        statusUpdate,
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

      return Ok(result.unwrap());
    },

    /**
     * Updates a request's status after running matches
     */
    async runMatches(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.post<null, RequestReadModel>(
        `/requests/${requestId}/run-matches`,
        `run matches for request ID ${requestId}`,
        null,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to run matches. Reason: ${error.message}`, ErrorCodes.REQUEST_RUN_MATCHES_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return Ok(result.unwrap());
    },

    /**
     * Deletes a request by its ID.
     */
    async deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>> {
      const result = await apiClient.delete(
        `/requests/${requestId}`,
        `delete request with ID ${requestId}`,
        undefined,
        accessToken,
      );

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
    async getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionMatchResponse, AppError>> {
      const result = await apiClient.get<CollectionMatchResponse>(
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
    async getRequestMatchById(
      requestId: number,
      matchId: number,
      accessToken: string,
    ): Promise<Result<MatchReadModel, AppError>> {
      const result = await apiClient.get<MatchReadModel>(
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
     * @returns Result<void, AppError> - API returns 204 No Content on success
     */
    async updateRequestMatchStatus(
      requestId: number,
      matchId: number,
      statusUpdate: MatchStatusUpdate,
      accessToken: string,
    ): Promise<Result<void, AppError>> {
      const result = await apiClient.post<MatchStatusUpdate, undefined>(
        `/requests/${requestId}/matches/${matchId}/status-change`,
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
     * Convenience method for approving a match.
     * @returns Result<void, AppError> - API returns 204 No Content on success
     */
    async approveRequestMatch(requestId: number, matchId: number, accessToken: string): Promise<Result<void, AppError>> {
      return this.updateRequestMatchStatus(requestId, matchId, { statusCode: MATCH_STATUS_CODE.approved }, accessToken);
    },

    /**
     * Get a specific candidate profile for a request.
     */
    async getRequestProfile(requestId: number, profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      const result = await apiClient.get<Profile>(
        `/requests/${requestId}/profiles/${profileId}`,
        `retrieve profile with ID ${profileId} for request ID ${requestId}`,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(
            new AppError(
              `Profile with ID ${profileId} for Request with ID ${requestId} not found.`,
              ErrorCodes.PROFILE_FOR_REQUEST_NOT_FOUND,
            ),
          );
        }
        return Err(error);
      }

      return Ok(result.unwrap());
    },

    /**
     * Cancels a request by its ID.
     */
    async cancelRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const result = await apiClient.post<null, RequestReadModel>(
        `/requests/${requestId}/cancel`,
        `cancel request with ID ${requestId}`,
        null,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to cancel request. Reason: ${error.message}`, ErrorCodes.REQUEST_CANCEL_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
      }

      return result;
    },

    /**
     * Update request match by its ID.
     */
    async updateRequestMatchById(
      requestId: number,
      matchId: number,
      matchUpdate: MatchUpdateModel,
      accessToken: string,
    ): Promise<Result<MatchReadModel, AppError>> {
      const result = await apiClient.put<MatchUpdateModel, MatchReadModel>(
        `/requests/${requestId}/matches/${matchId}`,
        `update match for match ${matchId} and request ID ${requestId}`,
        matchUpdate,
        accessToken,
      );

      if (result.isErr()) {
        const error = result.unwrapErr();
        if (error.httpStatusCode === HttpStatusCodes.NOT_FOUND) {
          return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
        }
        return Err(
          new AppError(`Failed to update match status. Reason: ${error.message}`, ErrorCodes.MATCH_UPDATE_FAILED, {
            httpStatusCode: error.httpStatusCode,
            correlationId: error.correlationId,
          }),
        );
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
