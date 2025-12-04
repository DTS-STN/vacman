import { Err, Ok } from 'oxide.ts';
import type { Result, Option } from 'oxide.ts';

import type {
  RequestReadModel,
  RequestUpdateModel,
  PagedRequestResponse,
  RequestQueryParams,
  RequestStatusUpdate,
  RequestStatus,
  User,
  PagedMatchResponse,
  MatchReadModel,
  MatchUpdateModel,
  Profile,
  MatchStatusUpdate,
  MatchQueryParams,
} from '~/.server/domain/models';
import { getCityService } from '~/.server/domain/services/city-service';
import { getClassificationService } from '~/.server/domain/services/classification-service';
import { getEmploymentEquityService } from '~/.server/domain/services/employment-equity-service';
import { getEmploymentTenureService } from '~/.server/domain/services/employment-tenure-service';
import { getLanguageForCorrespondenceService } from '~/.server/domain/services/language-for-correspondence-service';
import { getLanguageRequirementService } from '~/.server/domain/services/language-requirement-service';
import { getMatchFeedbackService } from '~/.server/domain/services/match-feedback-service';
import { getMatchStatusService } from '~/.server/domain/services/match-status-service';
import {
  createMockRequest,
  mockMatchDetails,
  mockMatches,
  mockProfiles,
  mockRequests,
  mockUsers,
} from '~/.server/domain/services/mock-data';
import { getNonAdvertisedAppointmentService } from '~/.server/domain/services/non-advertised-appointment-service';
import type { RequestService } from '~/.server/domain/services/request-service';
import { getSecurityClearanceService } from '~/.server/domain/services/security-clearance-service';
import { getSelectionProcessTypeService } from '~/.server/domain/services/selection-process-type-service';
import { getUserService } from '~/.server/domain/services/user-service';
import { getWorkScheduleService } from '~/.server/domain/services/work-schedule-service';
import { getWorkUnitService } from '~/.server/domain/services/workunit-service';
import { LogFactory } from '~/.server/logging';
import { MATCH_STATUS_CODE, REQUEST_EVENT_TYPE, REQUEST_STATUS_CODE } from '~/domain/constants';
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

      // Apply HR advisor filter using hrAdvisorId param
      if (params.hrAdvisorId) {
        if (params.hrAdvisorId.includes('me')) {
          // For mock purposes, filter by hrAdvisorId = 1 when hrAdvisorId=me
          filteredRequests = filteredRequests.filter((p) => p.hrAdvisor?.id === 1);
          log.debug(`Applied HR advisor filter (me): ${filteredRequests.length} requests remaining`);
        } else {
          const hrAdvisorId = parseInt(params.hrAdvisorId[0] ?? '0');
          if (!isNaN(hrAdvisorId)) {
            filteredRequests = filteredRequests.filter((p) => p.hrAdvisor?.id === hrAdvisorId);
            log.debug(`Applied HR advisor filter (${hrAdvisorId}): ${filteredRequests.length} requests remaining`);
          }
        }
      }

      if (params.requestId) {
        const requestIdFilter = Number.parseInt(params.requestId, 10);
        if (Number.isNaN(requestIdFilter)) {
          filteredRequests = [];
          log.debug('Request ID filter provided but not a number; returning zero requests');
        } else {
          filteredRequests = filteredRequests.filter((request) => request.id === requestIdFilter);
          log.debug(`Applied requestId filter (${requestIdFilter}): ${filteredRequests.length} requests remaining`);
        }
      }

      // Apply status filter using statusIds param (array of ids)
      if (params.statusId?.length) {
        const statusIds = params.statusId.filter((id) => id && id.trim() !== '');
        if (statusIds.length > 0) {
          filteredRequests = filteredRequests.filter((r) => (r.status ? statusIds.includes(r.status.id.toString()) : false));
          log.debug(`Applied statusId filter (${statusIds.join(',')}): ${filteredRequests.length} requests remaining`);
        }
      }

      if (params.classificationId?.length) {
        const classificationIds = params.classificationId.filter((id) => id && id.trim() !== '');
        if (classificationIds.length > 0) {
          filteredRequests = filteredRequests.filter((request) =>
            request.classification ? classificationIds.includes(request.classification.id.toString()) : false,
          );
          log.debug(
            `Applied classificationId filter (${classificationIds.join(',')}): ${filteredRequests.length} requests remaining`,
          );
        }
      }

      // Apply work unit filter using workUnitIds param (array of ids)
      if (params.workUnitId?.length) {
        const workUnitIds = params.workUnitId.filter((id) => id && id.trim() !== '');
        if (workUnitIds.length > 0) {
          filteredRequests = filteredRequests.filter((r) =>
            r.workUnit ? workUnitIds.includes(r.workUnit.id.toString()) : false,
          );
          log.debug(`Applied workUnitId filter (${workUnitIds.join(',')}): ${filteredRequests.length} requests remaining`);
        }
      }

      // Apply pagination
      const requestedPage = params.page ?? 1; // 1-based page from request
      const zeroBasedPage = requestedPage - 1; // Convert to 0-based for array slicing
      const size = params.size ?? 10;
      const startIndex = zeroBasedPage * size;
      const endIndex = startIndex + size;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      const response: PagedRequestResponse = {
        content: paginatedRequests,
        page: {
          number: requestedPage,
          size: size,
          totalElements: filteredRequests.length,
          totalPages: Math.ceil(filteredRequests.length / size),
        },
      };

      log.debug('Successfully retrieved requests', {
        totalFiltered: filteredRequests.length,
        pageSize: paginatedRequests.length,
        currentPage: requestedPage,
      });
      return Promise.resolve(Ok(response));
    },

    /**
     * Retrieves requests for the current user.
     */
    async getCurrentUserRequests(
      params: RequestQueryParams,
      accessToken: string,
    ): Promise<Result<PagedRequestResponse, AppError>> {
      log.debug('Attempting to retrieve current user requests', { params, accessTokenLength: accessToken.length });

      // For mock purposes, return requests for user ID 1
      let filteredRequests = [...mockRequests];
      log.debug(`Found ${filteredRequests.length} requests for current user`);

      // Apply status filter using statusIds param (array of ids)
      if (params.statusId?.length) {
        const statusIds = params.statusId.filter((id) => id && id.trim() !== '');
        if (statusIds.length > 0) {
          filteredRequests = filteredRequests.filter((r) => (r.status ? statusIds.includes(r.status.id.toString()) : false));
          log.debug(`Applied statusId filter (${statusIds.join(',')}): ${filteredRequests.length} requests remaining`);
        }
      }

      if (params.requestId) {
        const requestIdFilter = Number.parseInt(params.requestId, 10);
        if (Number.isNaN(requestIdFilter)) {
          filteredRequests = [];
          log.debug('Request ID filter provided but not a number for current user requests; returning zero requests');
        } else {
          filteredRequests = filteredRequests.filter((request) => request.id === requestIdFilter);
          log.debug(
            `Applied requestId filter for current user (${requestIdFilter}): ${filteredRequests.length} requests remaining`,
          );
        }
      }

      if (params.classificationId?.length) {
        const classificationIds = params.classificationId.filter((id) => id && id.trim() !== '');
        if (classificationIds.length > 0) {
          filteredRequests = filteredRequests.filter((request) =>
            request.classification ? classificationIds.includes(request.classification.id.toString()) : false,
          );
          log.debug(
            `Applied classificationId filter for current user (${classificationIds.join(',')}): ${filteredRequests.length} requests remaining`,
          );
        }
      }

      // Apply pagination
      const requestedPage = params.page ?? 1; // 1-based page from request
      const zeroBasedPage = requestedPage - 1; // Convert to 0-based for array slicing
      const size = params.size ?? 10;
      const startIndex = zeroBasedPage * size;
      const endIndex = startIndex + size;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      const response: PagedRequestResponse = {
        content: paginatedRequests,
        page: {
          number: requestedPage,
          size: size,
          totalElements: filteredRequests.length,
          totalPages: Math.ceil(filteredRequests.length / size),
        },
      };

      log.debug('Successfully retrieved requests', {
        totalFiltered: filteredRequests.length,
        pageSize: paginatedRequests.length,
        currentPage: requestedPage,
      });
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
        priorityEntitlement: requestUpdate.priorityEntitlement,
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
        hasPerformedSameDuties: requestUpdate.hasPerformedSameDuties ?? undefined,
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
          nameEn: 'Assigned - HR Review',
          nameFr: 'Assignée - Révision RH',
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
    async getRequestMatches(
      requestId: number,
      params: MatchQueryParams,
      accessToken: string,
    ): Promise<Result<PagedMatchResponse, AppError>> {
      log.debug(`Attempting to retrieve match with request ID: ${requestId}`, {
        accessTokenLength: accessToken.length,
      });

      let filteredMatches = [...mockMatches];
      log.debug(`Starting with ${filteredMatches.length} total matches`);

      filteredMatches = mockMatches.filter((m) => m.request?.id === requestId);
      if (filteredMatches.length > 0) {
        log.debug(`Successfully retrieved match with request ID: ${requestId}`);
      } else {
        log.debug(`Match with request ID ${requestId} not found`);
      }

      // Apply status filter using matchFeedbackId param (array of ids)
      if (params.matchFeedbackId?.length) {
        const matchFeedbackId = params.matchFeedbackId.filter((n) => Number.isFinite(n));
        filteredMatches = filteredMatches.filter((p) =>
          p.matchFeedback?.id ? matchFeedbackId.includes(p.matchFeedback.id) : false,
        );
        log.debug(`Applied matchFeedbackId filter (${matchFeedbackId.join(',')}): ${filteredMatches.length} matches remaining`);
      }

      // Apply status filter using wfaStatusId param (array of ids)
      if (params.profile?.wfaStatusId?.length) {
        const wfaStatusId = params.profile.wfaStatusId.filter((n) => Number.isFinite(n));
        filteredMatches = filteredMatches.filter((p) =>
          p.profile?.wfaStatus?.id ? wfaStatusId.includes(p.profile.wfaStatus.id) : false,
        );
        log.debug(`Applied wfaStatusId filter (${wfaStatusId.join(',')}): ${filteredMatches.length} matches remaining`);
      }

      if (params.profile?.employeeName?.trim()) {
        const search = params.profile.employeeName.trim().toLowerCase();
        filteredMatches = filteredMatches.filter((p) => {
          const firstName = p.profile?.firstName ?? '';
          const lastName = p.profile?.lastName ?? '';
          const fullName = `${firstName} ${lastName}`.toLowerCase();
          const reversedName = `${lastName} ${firstName}`.toLowerCase();
          return fullName.includes(search) || reversedName.includes(search);
        });
        log.debug(`Applied employeeName filter (${params.profile.employeeName}): ${filteredMatches.length} matches remaining`);
      }

      // Apply pagination
      const requestedPage = params.page ?? 1; // 1-based page from request
      const zeroBasedPage = requestedPage - 1; // Convert to 0-based for array slicing
      const size = params.size ?? 10;
      const startIndex = zeroBasedPage * size;
      const endIndex = startIndex + size;
      const paginatedMatches = filteredMatches.slice(startIndex, endIndex);
      log.debug(
        `Applied pagination (page: ${requestedPage}, size: ${size}): ${paginatedMatches.length} matches in current page`,
      );

      const response: PagedRequestResponse = {
        content: paginatedMatches,
        page: {
          number: requestedPage,
          size: size,
          totalElements: filteredMatches.length,
          totalPages: Math.ceil(filteredMatches.length / size),
        },
      };
      return Promise.resolve(Ok(response));
    },

    /**
     * Gets all matches for a request.
     */
    async getRequestMatchesDownload(
      requestId: number,
      params: MatchQueryParams,
      accessToken: string,
    ): Promise<Result<ArrayBuffer, AppError>> {
      //TODO: add proper download mock
      return Promise.resolve(Ok(new TextEncoder().encode('').buffer));
    },

    /**
     * Gets a specific match for a request.
     */
    async getRequestMatchById(
      requestId: number,
      matchId: number,
      accessToken: string,
    ): Promise<Result<MatchReadModel, AppError>> {
      log.debug(`Attempting to retrieve match ${matchId} for request ${requestId}`, {
        accessTokenLength: accessToken.length,
      });

      // Find the match by ID
      const match = mockMatchDetails.find((m) => m.id === matchId);
      if (!match) {
        log.debug(`Match with ID ${matchId} not found`);
        return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      // Validate that the match belongs to the specified request
      if (match.request?.id !== requestId) {
        log.debug(`Match ${matchId} does not belong to request ${requestId}`, {
          matchRequestId: match.request?.id,
          expectedRequestId: requestId,
        });
        return Err(new AppError(`Match ${matchId} for request ID ${requestId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      log.debug(`Successfully retrieved match ${matchId} for request ${requestId}`, {
        matchStatus: match.matchStatus?.code,
        profileId: match.profile?.id,
      });
      return Promise.resolve(Ok(match));
    },

    /**
     * Updates a request match status.
     */
    async updateRequestMatchStatus(
      requestId: number,
      matchId: number,
      statusUpdate: MatchStatusUpdate,
      accessToken: string,
    ): Promise<Result<void, AppError>> {
      const existingMatchIndex = mockMatchDetails.findIndex((r) => r.id === matchId);
      if (existingMatchIndex === -1) {
        return Err(new AppError(`Match with ID ${matchId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      const existingMatch = mockMatchDetails[existingMatchIndex];
      if (!existingMatch) {
        return Err(new AppError(`Match with ID ${matchId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      const matchStatuses = await getMatchStatusService().listAll();
      const matchStatus = matchStatuses.find((m) => m.code === statusUpdate.statusCode);
      if (!matchStatus) {
        return Err(new AppError(`Match status code ${statusUpdate.statusCode} not found.`, ErrorCodes.NO_MATCH_STATUS_FOUND));
      }

      // Merge updates with existing match
      const updatedMatch: MatchReadModel = {
        ...existingMatch,
        matchStatus: matchStatus,
        id: matchId, // Ensure ID doesn't change
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'mock-user',
      };

      mockMatchDetails[existingMatchIndex] = updatedMatch;
      return Promise.resolve(Ok(undefined));
    },

    /**
     * Convenience method for approving a match.
     */
    async approveRequestMatch(requestId: number, matchId: number, accessToken: string): Promise<Result<void, AppError>> {
      return this.updateRequestMatchStatus(requestId, matchId, { statusCode: MATCH_STATUS_CODE.approved }, accessToken);
    },

    /**
     * Convenience method for reverting a match approval to pending status
     */
    async revertApproveRequestMatch(requestId: number, matchId: number, accessToken: string): Promise<Result<void, AppError>> {
      return this.updateRequestMatchStatus(requestId, matchId, { statusCode: MATCH_STATUS_CODE.pending }, accessToken);
    },

    /**
     * Get a specific candidate profile for a request.
     */
    async getRequestProfile(requestId: number, profileId: number, accessToken: string): Promise<Result<Profile, AppError>> {
      // Mock implementation - it does not check if the profile is linked to the request match
      log.debug(`Attempting to retrieve profile with ID: ${profileId}`, {
        accessTokenLength: accessToken.length,
      });

      const profile = mockProfiles.find((p) => p.id === profileId);
      if (profile) {
        log.debug(`Successfully retrieved profile with ID: ${profileId}`, {
          profileStatus: profile.profileStatus?.code,
          userId: profile.profileUser.id,
        });
        return Promise.resolve(Ok(profile));
      }

      log.debug(`Profile with ID ${profileId} not found`);
      return Err(new AppError(`Profile with ID ${profileId} not found.`, ErrorCodes.PROFILE_NOT_FOUND));
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
     * Update request match by its ID.
     */
    async updateRequestMatchById(
      requestId: number,
      matchId: number,
      matchUpdate: MatchUpdateModel,
      accessToken: string,
    ): Promise<Result<MatchReadModel, AppError>> {
      const existingMatchIndex = mockMatchDetails.findIndex((r) => r.id === matchId);
      if (existingMatchIndex === -1) {
        return Err(new AppError(`Match with ID ${matchId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      const existingMatch = mockMatchDetails[existingMatchIndex];
      if (!existingMatch) {
        return Err(new AppError(`Match with ID ${matchId} not found.`, ErrorCodes.MATCH_NOT_FOUND));
      }

      const profile =
        matchUpdate.profileId !== undefined && matchUpdate.profileId !== existingMatch.profile?.id
          ? (await this.getRequestProfile(requestId, matchUpdate.profileId, accessToken)).into()
          : existingMatch.profile;

      if (!profile) {
        return Err(new AppError(`Profile for match update could not be found.`, ErrorCodes.PROFILE_NOT_FOUND));
      }

      // The profileUser is a required part of the profile, so we use its existing value
      const profileUser = profile.profileUser;

      const request = await this.getRequestById(requestId, accessToken);

      if (request.isErr()) {
        log.debug('Failed to retrieve Request for match');
        throw request.unwrapErr();
      }

      const matchStatus =
        matchUpdate.matchStatusId !== undefined
          ? (await getMatchStatusService().getById(matchUpdate.matchStatusId)).into()
          : existingMatch.matchStatus;

      const matchFeedback =
        matchUpdate.matchFeedbackId !== undefined
          ? (await getMatchFeedbackService().getById(matchUpdate.matchFeedbackId)).into()
          : existingMatch.matchFeedback;

      // Merge updates with existing match
      const updatedMatch: MatchReadModel = {
        ...existingMatch,
        ...matchUpdate,
        profile: {
          ...profile,
          profileUser: profileUser,
        },
        request: request.unwrap(),
        matchStatus,
        matchFeedback,
        hiringManagerComment: matchUpdate.hiringManagerComment ?? existingMatch.hiringManagerComment,
        hrAdvisorComment: matchUpdate.hrAdvisorComment ?? existingMatch.hrAdvisorComment,
        id: matchId, // Ensure ID doesn't change
        lastModifiedDate: new Date().toISOString(),
        lastModifiedBy: 'mock-user',
      };

      mockMatchDetails[existingMatchIndex] = updatedMatch;
      return Promise.resolve(Ok(updatedMatch));
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
