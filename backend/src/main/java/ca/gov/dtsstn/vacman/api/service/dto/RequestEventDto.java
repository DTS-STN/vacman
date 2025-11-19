package ca.gov.dtsstn.vacman.api.service.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Data Transfer Object (DTO) for request events.
 */
@RecordBuilder
public record RequestEventDto(
	String additionalComment,
	List<String> additionalContactEmails,
	Boolean bilingual,
	String classificationNameEn,
	String classificationNameFr,
	String createdBy,
	Instant createdDate,
	Boolean employmentEquityNeedIdentifiedIndicator,
	LocalDate endDate,
	Boolean hasPerformedSameDuties,
	List<String> hiringManagerEmails,
	String hrAdvisorEmail,
	Long id,
	String languageCode,
	String languageProfileEn,
	String languageProfileFr,
	String languageRequirementNameEn,
	String languageRequirementNameFr,
	String lastModifiedBy,
	Instant lastModifiedDate,
	String location,
	String nameEn,
	String nameFr,
	String positionNumber,
	String priorityClearanceNumber,
	Boolean priorityEntitlement,
	String priorityEntitlementRationale,
	String pscClearanceNumber,
	String requestNumber,
	String securityClearanceNameEn,
	String securityClearanceNameFr,
	String selectionProcessNumber,
	String somcAndConditionEmploymentEn,
	String somcAndConditionEmploymentFr,
	LocalDate startDate,
	List<String> subDelegatedManagerEmails,
	String submitterEmail,
	List<String> submitterEmails,
	String submitterName,
	Boolean teleworkAllowed,
	Boolean workforceMgmtApprovalRecvd
) {}