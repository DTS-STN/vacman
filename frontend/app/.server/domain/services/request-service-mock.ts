import { Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import { getLanguageRequirementService } from './language-requirement-service';
import { getSecurityClearanceService } from './security-clearance-service';

import type {
  RequestReadModel,
  RequestUpdateModel,
  PagedRequestResponse,
  CollectionRequestResponse,
  RequestQueryParams,
  PagedProfileResponse,
  RequestStatus,
} from '~/.server/domain/models';
import { createMockRequest, mockRequests } from '~/.server/domain/services/mockData';
import type { RequestService } from '~/.server/domain/services/request-service';
import { LogFactory } from '~/.server/logging';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

const log = LogFactory.getLogger(import.meta.url);

export function getMockRequestService(): RequestService {
  return {
    /**
     * Retrieves a paginated list of requests with optional filtering.
     */
    async getRequests(params: RequestQueryParams, accessToken: string): Promise<Result<PagedRequestResponse, AppError>> {
      log.debug('Attempting to retrieve requests', { params, accessTokenLength: accessToken.length });

      let filteredRequests = [...mockRequests];
      log.debug(`Starting with ${filteredRequests.length} total requests`);

      // Apply status filter
      if (params.status) {
        filteredRequests = filteredRequests.filter((r) => r.status?.code.toLowerCase() === params.status?.toLowerCase());
        log.debug(`Applied status filter (${params.status}): ${filteredRequests.length} requests remaining`);
      }

      // Apply pagination
      const page = params.page ?? 0;
      const size = params.size ?? 10;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      const response: PagedRequestResponse = {
        content: paginatedRequests,
        page: {
          number: page,
          size: size,
          totalElements: filteredRequests.length,
          totalPages: Math.ceil(filteredRequests.length / size),
        },
      };

      log.debug('Successfully retrieved requests', {
        totalFiltered: filteredRequests.length,
        pageSize: paginatedRequests.length,
        currentPage: page,
      });
      return Promise.resolve(Ok(response));
    },

    /**
     * Retrieves requests for the current user.
     */
    async getCurrentUserRequests(accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      log.debug('Attempting to retrieve current user requests', { accessTokenLength: accessToken.length });

      // For mock purposes, return requests for user ID 1
      const userRequests = [...mockRequests];
      log.debug(`Found ${userRequests.length} requests for current user`);

      const response: CollectionRequestResponse = {
        content: userRequests,
      };

      log.debug('Successfully retrieved current user requests', { requestCount: userRequests.length });
      return Promise.resolve(Ok(response));
    },

    /**
     * Creates a new request for the current user.
     */
    async createRequest(accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      log.debug('Attempting to create new request', { accessTokenLength: accessToken.length });

      const newRequest = createMockRequest(accessToken);
      log.debug('Successfully created new request', {
        requestId: newRequest.id,
        status: newRequest.status?.code,
      });
      return Promise.resolve(Ok(newRequest));
    },

    /**
     * Retrieves a request by its ID.
     */
    async getRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      log.debug(`Attempting to retrieve request with ID: ${requestId}`, {
        accessTokenLength: accessToken.length,
      });

      const request = mockRequests.find((r) => r.id === requestId);

      if (request) {
        log.debug(`Successfully retrieved request with ID: ${requestId}`, {
          status: request.status?.code,
        });
        return Promise.resolve(Ok(request));
      }

      log.debug(`Request with ID ${requestId} not found`);
      return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
    },

    /**
     * Updates a request by its ID.
     */
    async updateRequestById(
      requestId: number,
      requestUpdate: RequestUpdateModel,
      accessToken: string,
    ): Promise<Result<RequestReadModel, AppError>> {
      const existingRequestIndex = mockRequests.findIndex((r) => r.id === requestId);
      if (existingRequestIndex === -1) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const existingRequest = mockRequests[existingRequestIndex];
      if (!existingRequest) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const languageRequirementService = getLanguageRequirementService();
      const classificationService = getLanguageRequirementService();
      const securityClearanceService = getSecurityClearanceService();

      const languageRequirement =
        requestUpdate.languageRequirementId !== undefined
          ? (await Promise.all([languageRequirementService.getById(requestUpdate.languageRequirementId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingRequest.languageRequirement;

      const classification =
        requestUpdate.classificationId !== undefined
          ? (await Promise.all([classificationService.getById(requestUpdate.classificationId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingRequest.classification;

      let securityClearance = existingRequest.securityClearance;
      if (requestUpdate.securityClearanceId) {
        const securityClearanceResult = await securityClearanceService.getById(requestUpdate.securityClearanceId);
        if (securityClearanceResult.isOk()) {
          securityClearance = securityClearanceResult.unwrap();
        }
      }

      // Merge updates with existing request
      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        ...requestUpdate,
        englishTitle: requestUpdate.englishTitle ?? existingRequest.englishTitle,
        frenchTitle: requestUpdate.frenchTitle ?? existingRequest.frenchTitle,
        languageRequirement,
        classification,
        englishLanguageProfile: requestUpdate.englishLanguageProfile ?? existingRequest.englishLanguageProfile,
        frenchLanguageProfile: requestUpdate.frenchLanguageProfile ?? existingRequest.frenchLanguageProfile,
        securityClearance,
        id: requestId, // Ensure ID doesn't change
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'mock-user',
      };

      mockRequests[existingRequestIndex] = updatedRequest;
      return Promise.resolve(Ok(updatedRequest));
    },

    /**
     * Updates a request's status.
     */
    async updateRequestStatus(requestId: number, statusUpdate: unknown, accessToken: string): Promise<Result<void, AppError>> {
      const existingRequestIndex = mockRequests.findIndex((r) => r.id === requestId);
      if (existingRequestIndex === -1) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const existingRequest = mockRequests[existingRequestIndex];
      if (!existingRequest) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      // Mock status update - in real implementation, you'd validate and apply the status update
      const newStatus: RequestStatus = {
        id: 1,
        code: 'PENDING',
        nameEn: 'Pending',
        nameFr: 'En attente',
      };

      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        status: newStatus,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockRequests[existingRequestIndex] = updatedRequest;
      return Promise.resolve(Ok(undefined));
    },

    /**
     * Deletes a request by its ID.
     */
    async deleteRequestById(requestId: number, accessToken: string): Promise<Result<void, AppError>> {
      const existingRequestIndex = mockRequests.findIndex((r) => r.id === requestId);
      if (existingRequestIndex === -1) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      mockRequests.splice(existingRequestIndex, 1);
      return Promise.resolve(Ok(undefined));
    },

    /**
     * Gets all matches for a request.
     */
    async getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionRequestResponse, AppError>> {
      // Mock implementation - return empty collection
      const response: CollectionRequestResponse = {
        content: [],
      };
      return Promise.resolve(Ok(response));
    },

    /**
     * Gets a specific match for a request.
     */
    async getRequestMatchById(requestId: number, matchId: number, accessToken: string): Promise<Result<unknown, AppError>> {
      return Promise.resolve(
        Promise.resolve(
          Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND)),
        ),
      );
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
      return Promise.resolve(
        Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND)),
      );
    },

    /**
     * Gets candidate profiles for a request.
     */
    async getRequestProfiles(requestId: number, accessToken: string): Promise<Result<PagedProfileResponse, AppError>> {
      // Mock implementation - return empty paginated response
      const response: PagedProfileResponse = {
        content: [],
        page: {
          number: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      return Promise.resolve(Ok(response));
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
