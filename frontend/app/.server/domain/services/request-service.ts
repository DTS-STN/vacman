import type { Option, Result } from 'oxide.ts';

import type {
  RequestReadModel,
  RequestUpdateModel,
  PagedRequestResponse,
  CollectionRequestResponse,
  RequestQueryParams,
  PagedProfileResponse,
} from '~/.server/domain/models';
import { getDefaultRequestService } from '~/.server/domain/services/request-service-default';
import { getMockRequestService } from '~/.server/domain/services/request-service-mock';
import { serverEnvironment } from '~/.server/environment';
import type { AppError } from '~/errors/app-error';

export type RequestService = {
  // GET /api/v1/requests - Get requests with pagination and filtering
  getRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>>;

  // GET /api/v1/requests/me - Get requests for current user
  getCurrentUserRequests(accessToken: string): Promise<Result<CollectionRequestResponse, AppError>>;

  // POST /api/v1/requests/me - Create a new request for current user
  createRequest(accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // GET /api/v1/requests/{id} - Get a request by ID
  getRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>>;

  // PUT /api/v1/requests/{id} - Update a request by ID
  updateRequestById(
    requestId: number,
    request: RequestUpdateModel,
    accessToken: string,
  ): Promise<Result<RequestReadModel, AppError>>;

  // PUT /api/v1/requests/{id}/status - Update request status
  updateRequestStatus(
    requestId: number,
    statusUpdate: unknown, // TODO: Define proper status update type
    accessToken: string,
  ): Promise<Result<void, AppError>>;

  // DELETE /api/v1/requests/{id} - Delete a request by ID
  deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>>;

  // GET /api/v1/requests/{id}/matches - Get all matches for a request
  getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionRequestResponse, AppError>>;

  // GET /api/v1/requests/{id}/matches/{matchId} - Get specific match for a request
  getRequestMatchById(requestId: number, matchId: number, accessToken: string): Promise<Result<unknown, AppError>>; // TODO: Define match type

  // PUT /api/v1/requests/{id}/matches/{matchId}/status - Update match status
  updateRequestMatchStatus(
    requestId: number,
    matchId: number,
    statusUpdate: unknown, // TODO: Define match status update type
    accessToken: string,
  ): Promise<Result<void, AppError>>;

  // GET /api/v1/requests/{id}/profiles - Get candidate profiles for a request
  getRequestProfiles(requestId: number, accessToken: string): Promise<Result<PagedProfileResponse, AppError>>;

  // Optional method for finding request by ID
  findRequestById(requestId: number, accessToken: string): Promise<Option<RequestReadModel>>;
};

export function getRequestService(): RequestService {
  return serverEnvironment.ENABLE_REQUEST_SERVICES_MOCK ? getMockRequestService() : getDefaultRequestService();
}
