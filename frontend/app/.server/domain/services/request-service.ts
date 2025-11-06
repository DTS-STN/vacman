import type { Option, Result } from 'oxide.ts';

import type {
  PagedMatchResponse,
  MatchReadModel,
  MatchStatusUpdate,
  MatchUpdateModel,
  PagedRequestResponse,
  Profile,
  RequestQueryParams,
  RequestReadModel,
  RequestStatusUpdate,
  RequestUpdateModel,
  MatchQueryParams,
} from '~/.server/domain/models';
import { getDefaultRequestService } from '~/.server/domain/services/request-service-default';
import { getMockRequestService } from '~/.server/domain/services/request-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type RequestService = {
  // GET /api/v1/requests - Get requests with pagination and filtering
  getRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>>;

  // GET /api/v1/requests/me - Get requests with pagination and filtering for current user
  getCurrentUserRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>>;

  // POST /api/v1/requests/me - Create a new request for current user
  createRequest(accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // DELETE /api/v1/requests/{id} - Delete a request by ID
  deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>>;

  // GET /api/v1/requests/{id} - Get a request by ID
  getRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // PUT /api/v1/requests/{id} - Update a request by ID
  updateRequestById(
    requestId: number,
    request: RequestUpdateModel,
    accessToken: string,
  ): Promise<Result<RequestReadModel, AppError>>;

  //POST /api/v1/requests/{id}/cancel - Cancel a request by ID
  cancelRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // GET /api/v1/requests/{id}/matches - Get all matches for a request
  getRequestMatches(
    requestId: number,
    params: MatchQueryParams,
    accessToken: string,
  ): Promise<Result<PagedMatchResponse, AppError>>;

  // GET /api/v1/requests/{id}/matches/{matchId} - Get specific match for a request
  getRequestMatchById(requestId: number, matchId: number, accessToken: string): Promise<Result<MatchReadModel, AppError>>;

  // PUT /api/v1/requests/{id}/matches/{matchId} - Update match by ID
  updateRequestMatchById(
    requestId: number,
    matchId: number,
    matchUpdate: MatchUpdateModel,
    accessToken: string,
  ): Promise<Result<MatchReadModel, AppError>>;

  // POST /api/v1/requests/{id}/matches/{matchId}/status-change - Update match status
  updateRequestMatchStatus(
    requestId: number,
    matchId: number,
    statusUpdate: MatchStatusUpdate,
    accessToken: string,
  ): Promise<Result<void, AppError>>;

  // Convenience method for approving a match
  approveRequestMatch(requestId: number, matchId: number, accessToken: string): Promise<Result<void, AppError>>;

  // GET /api/v1/requests/{id}/profiles/{profileId} - Get a specific candidate profile for a request
  getRequestProfile(requestId: number, profileId: number, accessToken: string): Promise<Result<Profile, AppError>>;

  // POST /api/v1/requests/{id}/run-matches - initiate running matches - Update request status after running matches
  // returns the Request with updated request status with "NO_MATCH_HR_REVIEW" if no matches found or "FDBK_PENDING" if there are matches
  runMatches(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // POST /api/v1/requests/{id}/status-change - Update request status
  updateRequestStatus(
    requestId: number,
    statusUpdate: RequestStatusUpdate,
    accessToken: string,
  ): Promise<Result<RequestReadModel, AppError>>;

  // Optional method for finding request by ID
  findRequestById(requestId: number, accessToken: string): Promise<Option<RequestReadModel>>;
};

export function getRequestService(): RequestService {
  return serverEnvironment.ENABLE_REQUEST_SERVICES_MOCK ? getMockRequestService() : getDefaultRequestService();
}
