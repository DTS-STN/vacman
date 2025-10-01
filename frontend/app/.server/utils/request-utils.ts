import type { RequestReadModel, RequestUpdateModel } from '~/.server/domain/models';

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
    alternateContactEmailAddress: request.alternateContactEmailAddress,
    appointmentNonAdvertisedId: request.appointmentNonAdvertised?.id,
    cityIds: request.cities?.map((city) => ({ value: city.id })) ?? [],
    classificationId: request.classification?.id,
    employmentEquityIds: request.employmentEquities?.map((employmentEquity) => ({ value: employmentEquity.id })) ?? [],
    employmentTenureId: request.employmentTenure?.id,
    englishLanguageProfile: request.englishLanguageProfile,
    englishStatementOfMerit: request.englishStatementOfMerit,
    englishTitle: request.englishTitle,
    equityNeeded: request.equityNeeded,
    frenchLanguageProfile: request.frenchLanguageProfile,
    frenchStatementOfMerit: request.frenchStatementOfMerit,
    frenchTitle: request.frenchTitle,
    hasPerformedSameDuties: request.hasPerformedSameDuties,
    hiringManagerId: request.hiringManager?.id,
    hrAdvisorId: request.hrAdvisor?.id,
    languageOfCorrespondenceId: request.languageOfCorrespondence?.id,
    languageRequirementId: request.languageRequirement?.id,
    positionNumbers: request.positionNumber,
    priorityClearanceNumber: request.priorityClearanceNumber,
    priorityEntitlement: request.priorityEntitlement,
    priorityEntitlementRationale: request.priorityEntitlementRationale,
    projectedEndDate: request.projectedEndDate,
    projectedStartDate: request.projectedStartDate,
    pscClearanceNumber: request.pscClearanceNumber,
    requestNumber: request.requestNumber,
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
