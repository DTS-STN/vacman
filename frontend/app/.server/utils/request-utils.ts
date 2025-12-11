import type { MatchReadModel, MatchUpdateModel, RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';

/**
 * Maps a Request read model to a RequestUpdateModel for updating via PUT endpoint.
 * This function extracts IDs from nested objects and ensures all fields are properly mapped
 * to prevent null value errors when calling the PUT /api/v1/requests/{id} endpoint.
 *
 * @param request The request read model to convert
 * @returns A complete RequestUpdateModel with all fields mapped from the source request
 *
 * @example
 * ```typescript
 * // Basic usage - convert request to put model format
 * const request = await requestService.getRequestById(requestId, accessToken);
 * const putModel = mapRequestToPutModel(request);
 * await requestService.updateRequestById(requestId, putModel, accessToken);
 * ```
 */
export function mapRequestToUpdateModel(request: RequestReadModel): RequestUpdateModel {
  return {
    additionalComment: request.additionalComment,
    additionalContactId: request.additionalContact?.id,
    appointmentNonAdvertisedId: request.appointmentNonAdvertised?.id,
    cityIds: request.cities?.map((city) => ({ value: city.id })) ?? [],
    classificationId: request.classification?.id,
    employmentEquityIds: request.employmentEquities?.map((employmentEquity) => ({ value: employmentEquity.id })) ?? [],
    employmentTenureId: request.employmentTenure?.id,
    englishStatementOfMerit: request.englishStatementOfMerit,
    englishTitle: request.englishTitle,
    equityNeeded: request.equityNeeded,
    frenchStatementOfMerit: request.frenchStatementOfMerit,
    frenchTitle: request.frenchTitle,
    hasPerformedSameDuties: request.hasPerformedSameDuties,
    hiringManagerId: request.hiringManager?.id,
    hrAdvisorId: request.hrAdvisor?.id,
    languageOfCorrespondenceId: request.languageOfCorrespondence?.id,
    languageRequirementIds: request.languageRequirements?.map((req) => ({ value: req.id })) ?? [],
    positionNumbers: request.positionNumber,
    priorityClearanceNumber: request.priorityClearanceNumber,
    priorityEntitlement: request.priorityEntitlement,
    priorityEntitlementRationale: request.priorityEntitlementRationale,
    projectedEndDate: request.projectedEndDate,
    projectedStartDate: request.projectedStartDate,
    pscClearanceNumber: request.pscClearanceNumber,
    securityClearanceId: request.securityClearance?.id,
    selectionProcessNumber: request.selectionProcessNumber,
    selectionProcessTypeId: request.selectionProcessType?.id,
    statusId: request.status?.id,
    subDelegatedManagerId: request.subDelegatedManager?.id,
    submitterId: request.submitter?.id,
    teleworkAllowed: request.teleworkAllowed,
    workScheduleId: request.workSchedule?.id,
    workUnitId: request.workUnit?.id,
    workforceMgmtApprovalRecvd: request.workforceMgmtApprovalRecvd,
  };
}

/**
 * Maps a Request read model to a RequestUpdateModel with specific field overrides.
 * This is useful when you want to update only certain fields while preserving all others.
 *
 * @param request The request read model to convert
 * @param overrides Partial RequestUpdateModel with fields to override
 * @returns A complete RequestUpdateModel with overridden fields applied
 *
 * @example
 * ```typescript
 * // Update only equityNeeded while preserving all other fields
 * const request = await requestService.getRequestById(requestId, accessToken);
 * const putModel = mapRequestToUpdateModelWithOverrides(request, {
 *   equityNeeded: true,
 * });
 * await requestService.updateRequestById(requestId, putModel, accessToken));
 *
 * // Update multiple fields
 * const putModel = mapRequestToUpdateModelWithOverrides(request, {
 *   englishTitle: 'new request',
 *   hasPerformedSameDuties: false,
 *   cityIds: [1, 2, 3], // Array of city IDs
 * });
 * ```
 */
export function mapRequestToUpdateModelWithOverrides(
  request: RequestReadModel,
  overrides: Partial<RequestUpdateModel>,
): RequestUpdateModel {
  const basePutModel = mapRequestToUpdateModel(request);
  return { ...basePutModel, ...overrides };
}

/**
 * Maps a MatchReadModel to a MatchUpdateModel for updating via PUT endpoint.
 * This function extracts IDs from nested objects and ensures all fields are properly mapped
 * to prevent null value errors when calling the PUT /api/v1/requests/{id}/matches/{matchId} endpoint.
 *
 * @param match The match read model to convert
 * @returns A complete MatchUpdateModel with all fields mapped from the source match
 *
 * @example
 * ```typescript
 * // Basic usage - convert match to put model format
 * const match = await requestService.getRequestMatchById(requestId, matchId, accessToken);
 * const putModel = mapMatchToUpdateModel(match);
 * await requestService.updateRequestMatchById(requestId, matchId, putModel, accessToken);
 * ```
 */
export function mapMatchToUpdateModel(match: MatchReadModel): MatchUpdateModel {
  return {
    profileId: match.profile?.id,
    requestId: match.request?.id,
    matchStatusId: match.matchStatus?.id,
    matchFeedbackId: match.matchFeedback?.id,
    hiringManagerComment: match.hiringManagerComment,
    hrAdvisorComment: match.hrAdvisorComment,
  };
}

/**
 * Maps a MatchReadModel to a MatchUpdateModel with specific field overrides.
 * This is useful when you want to update only certain fields while preserving all others.
 *
 * @param match The match read model to convert
 * @param overrides Partial MatchUpdateModel with fields to override
 * @returns A complete MatchUpdateModel with overridden fields applied
 *
 * @example
 * ```typescript
 * // Update only hiringManagerComment while preserving all other fields
 * const match = await requestService.getRequestMatchById(requestId, matchId, accessToken);
 * const putModel = mapMatchToUpdateModelWithOverrides(match, {
 *   hiringManagerComment: 'New comment',
 * });
 * await requestService.updateRequestMatchById(requestId, matchId, putModel, accessToken);
 *
 * // Update multiple fields
 * const putModel = mapMatchToUpdateModelWithOverrides(match, {
 *   matchFeedbackId: 1,
 *   hiringManagerComment: 'New comment',
 * });
 * ```
 */
export function mapMatchToUpdateModelWithOverrides(
  match: MatchReadModel,
  overrides: Partial<MatchUpdateModel>,
): MatchUpdateModel {
  const basePutModel = mapMatchToUpdateModel(match);
  return { ...basePutModel, ...overrides };
}
