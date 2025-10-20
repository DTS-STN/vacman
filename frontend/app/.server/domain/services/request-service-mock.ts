import { Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type {
  RequestReadModel,
  RequestUpdateModel,
  PagedRequestResponse,
  CollectionRequestResponse,
  RequestQueryParams,
  PagedProfileResponse,
  RequestStatusUpdate,
  RequestStatus,
  User,
  CollectionMatchResponse,
  MatchReadModel,
} from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { createMockRequest, mockMatches, mockRequests, mockUsers } from '~/.server/domain/services/mock-data';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import type { RequestService } from '~/.server/domain/services/request-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { LogFactory } from '~/.server/logging';
import { REQUEST_EVENT_TYPE, REQUEST_STATUS_CODE } from '~/domain/constants';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { randomString } from '~/utils/string-utils';

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

      const selectionProcessType =
        requestUpdate.selectionProcessTypeId !== undefined
          ? (await getSelectionProcessTypeService().getById(requestUpdate.selectionProcessTypeId)).into()
          : existingRequest.selectionProcessType;

      const employmentTenure =
        requestUpdate.employmentTenureId !== undefined
          ? (await getEmploymentTenureService().getById(requestUpdate.employmentTenureId)).into()
          : existingRequest.employmentTenure;

      const incomingEmploymentEquityIds = requestUpdate.employmentEquityIds?.map((ee) => ee.value);
      const employmentEquities =
        incomingEmploymentEquityIds !== undefined
          ? (await getEmploymentEquityService().listAll()).filter(({ id }) => incomingEmploymentEquityIds.includes(id))
          : existingRequest.employmentEquities;

      const workSchedule =
        requestUpdate.workScheduleId !== undefined
          ? (await getWorkScheduleService().getById(requestUpdate.workScheduleId)).into()
          : existingRequest.workSchedule;

      const languageRequirement =
        requestUpdate.languageRequirementId !== undefined
          ? (await getLanguageRequirementService().getById(requestUpdate.languageRequirementId)).into()
          : existingRequest.languageRequirement;

      const classification =
        requestUpdate.classificationId !== undefined
          ? (await getClassificationService().getById(requestUpdate.classificationId)).into()
          : existingRequest.classification;

      const securityClearance =
        requestUpdate.securityClearanceId !== undefined
          ? (await getSecurityClearanceService().getById(requestUpdate.securityClearanceId)).into()
          : existingRequest.securityClearance;

      const incomingCityIds = requestUpdate.cityIds?.map((city) => city.value);
      const cities =
        incomingCityIds !== undefined
          ? (await getCityService().listAll()).filter(({ id }) => incomingCityIds.includes(id))
          : existingRequest.cities;

      const appointmentNonAdvertised =
        requestUpdate.appointmentNonAdvertisedId !== undefined
          ? (await getNonAdvertisedAppointmentService().getById(requestUpdate.appointmentNonAdvertisedId)).into()
          : existingRequest.appointmentNonAdvertised;

      const submitter =
        requestUpdate.submitterId !== undefined
          ? (await getUserService().getUserById(requestUpdate.submitterId, accessToken)).into()
          : existingRequest.submitter;

      const hiringManager =
        requestUpdate.hiringManagerId !== undefined
          ? (await getUserService().getUserById(requestUpdate.hiringManagerId, accessToken)).into()
          : existingRequest.hiringManager;

      const subDelegatedManager =
        requestUpdate.subDelegatedManagerId !== undefined
          ? (await getUserService().getUserById(requestUpdate.subDelegatedManagerId, accessToken)).into()
          : existingRequest.subDelegatedManager;

      const workUnit =
        requestUpdate.workUnitId !== undefined
          ? (await Promise.all([getWorkUnitService().getById(requestUpdate.workUnitId)]))
              .filter((result) => result.isOk())
              .map((result) => result.unwrap())[0]
          : existingRequest.workUnit;

      const languageOfCorrespondence =
        requestUpdate.languageOfCorrespondenceId !== undefined
          ? (await getLanguageForCorrespondenceService().getById(requestUpdate.languageOfCorrespondenceId)).into()
          : existingRequest.languageOfCorrespondence;

      // Merge updates with existing request
      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        ...requestUpdate,
        positionNumber: requestUpdate.positionNumbers ?? existingRequest.positionNumber,
        englishTitle: requestUpdate.englishTitle ?? existingRequest.englishTitle,
        frenchTitle: requestUpdate.frenchTitle ?? existingRequest.frenchTitle,
        languageRequirement,
        cities,
        classification,
        englishLanguageProfile: requestUpdate.englishLanguageProfile ?? existingRequest.englishLanguageProfile,
        frenchLanguageProfile: requestUpdate.frenchLanguageProfile ?? existingRequest.frenchLanguageProfile,
        securityClearance,
        selectionProcessType,
        employmentTenure,
        workSchedule,
        submitter,
        hiringManager,
        subDelegatedManager,
        workUnit,
        languageOfCorrespondence,
        employmentEquities,
        appointmentNonAdvertised,
        hasPerformedSameDuties: requestUpdate.hasPerformedSameDuties,
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
    async updateRequestStatus(
      requestId: number,
      statusUpdate: RequestStatusUpdate,
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

      const statusByEvent: Partial<Record<RequestStatusUpdate['eventType'], RequestStatus>> = {
        requestSubmitted: {
          id: 1,
          code: 'SUBMIT',
          nameEn: 'Request Submitted',
          nameFr: 'Demande soumise',
        },
        requestPickedUp: {
          id: 2,
          code: 'HR_REVIEW',
          nameEn: 'HR Review',
          nameFr: 'Révision RH',
        },
        vmsNotRequired: {
          id: 7,
          code: 'PENDING_PSC_NO_VMS',
          nameEn: 'VMS not required - Pending PSC clearance',
          nameFr: "Demande VMS non-requise - En attente de l'autorisation de la CFP",
        },
        submitFeedback: {
          id: 4,
          code: 'FDBK_PENDING',
          nameEn: 'Feedback Pending',
          nameFr: 'Rétroaction en attente',
        },
        pscNotRequired: {
          id: 8,
          code: 'CLR_GRANTED',
          nameEn: 'Clearance Granted',
          nameFr: 'Autorisation accordée',
        },
        pscRequired: {
          id: 6,
          code: 'PENDING_PSC',
          nameEn: 'VMS request on Hold - Pending PSC clearance',
          nameFr: "Demande VMS en suspens - En attente de l'autorisation de la CFP",
        },
        complete: {
          id: 9,
          code: 'PSC_GRANTED',
          nameEn: 'PSC Clearance Granted',
          nameFr: 'Autorisation de la CFP accordée',
        },
      };

      const newStatus = statusByEvent[statusUpdate.eventType] ?? existingRequest.status;

      let hrAdvisor: User | undefined = undefined; // Only assign hrAdvisor for the pickedUp event
      let priorityClearanceNumber: string | undefined = undefined;

      switch (statusUpdate.eventType) {
        case REQUEST_EVENT_TYPE.pickedUp:
          hrAdvisor = mockUsers.find((u) => u.userType?.code === 'HRA');
          break;
        case REQUEST_EVENT_TYPE.vmsNotRequired:
        case REQUEST_EVENT_TYPE.pscRequired:
        case REQUEST_EVENT_TYPE.pscNotRequired:
          priorityClearanceNumber = randomString(16).toUpperCase();
          break;
      }

      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        status: newStatus,
        hrAdvisor: hrAdvisor ?? existingRequest.hrAdvisor,
        priorityClearanceNumber: priorityClearanceNumber ?? existingRequest.priorityClearanceNumber,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockRequests[existingRequestIndex] = updatedRequest;
      return Promise.resolve(Ok(updatedRequest));
    },

    /**
     * Updates a request's status after running matches
     */
    async runMatches(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const existingRequestIndex = mockRequests.findIndex((r) => r.id === requestId);
      if (existingRequestIndex === -1) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const existingRequest = mockRequests[existingRequestIndex];
      if (!existingRequest) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      // Simulate running matches and updating the request status
      const hasMatches = Math.random() > 0.5; // Randomly determine if there are matches
      const newStatus = hasMatches
        ? {
            id: 4,
            code: 'FDBK_PENDING',
            nameEn: 'Approved - Assessment Feedback Pending',
            nameFr: "Approuvée - En attente de retroaction d'évaluation",
          }
        : {
            id: 3,
            code: 'NO_MATCH_HR_REVIEW',
            nameEn: 'No match - HR Review',
            nameFr: 'Aucune candidature repérée - Revue RH',
          };

      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        status: newStatus,
        hasMatches: newStatus.code === REQUEST_STATUS_CODE.FDBK_PENDING,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockRequests[existingRequestIndex] = updatedRequest;
      return Promise.resolve(Ok(updatedRequest));
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
    async getRequestMatches(requestId: number, accessToken: string): Promise<Result<CollectionMatchResponse, AppError>> {
      log.debug(`Attempting to retrieve match with request ID: ${requestId}`, {
        accessTokenLength: accessToken.length,
      });

      const match = mockMatches.find((m) => m.request?.id === requestId);

      if (match) {
        log.debug(`Successfully retrieved match with request ID: ${requestId}`, {
          profileId: match.profile?.id,
          requestId: match.request?.id,
          matchStatus: match.matchStatus?.code,
        });
        const response: CollectionMatchResponse = {
          content: [match],
        };
        return Promise.resolve(Ok(response));
      }

      log.debug(`Match with request ID ${requestId} not found`);
      return Err(new AppError(`Match with request ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
    },

    /**
     * Gets a specific match for a request.
     */
    async getRequestMatchById(
      requestId: number,
      matchId: number,
      accessToken: string,
    ): Promise<Result<MatchReadModel, AppError>> {
      return Promise.resolve(
        Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND)),
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
     * Cancels a request by its ID.
     */
    async cancelRequestById(requestId: number, accessToken: string): Promise<Result<RequestReadModel, AppError>> {
      const existingRequestIndex = mockRequests.findIndex((r) => r.id === requestId);
      if (existingRequestIndex === -1) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const existingRequest = mockRequests[existingRequestIndex];
      if (!existingRequest) {
        return Err(new AppError(`Request with ID ${requestId} not found.`, ErrorCodes.REQUEST_NOT_FOUND));
      }

      const newStatus: RequestStatus = {
        id: 10,
        code: 'CANCELLED',
        nameEn: 'Cancelled',
        nameFr: 'Annulée',
      };

      const updatedRequest: RequestReadModel = {
        ...existingRequest,
        status: newStatus,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'system',
      };

      mockRequests[existingRequestIndex] = updatedRequest;
      return Promise.resolve(Ok(updatedRequest));
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
