package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;

import io.soabase.recordbuilder.core.RecordBuilderFull;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@RecordBuilderFull
@Schema(name = "RequestRead")
public record RequestReadModel(
	String selectionProcessNumber,
	Boolean workforceManagementApproved,
	Boolean priorityEntitlement,
	String priorityEntitlementRationale,
	Long selectionProcessTypeId,
	Boolean performedSameDuties,
	Long nonAdvertisedAppointmentId,
	LocalDate projectedStartDate,
	LocalDate projectedEndDate,
	Long workScheduleId,
	Boolean equityNeeded,
	Collection<Long> employmentEquityIds,
	Collection<String> positionNumbers,
	Long classificationId,
	String englishTitle,
	String frenchTitle,
	Long provinceId,
	Long languageRequirementId,
	String englishLanguageProfile,
	String frenchLanguageProfile,
	Long securityClearanceId,
	String englishStatementOfMerit,
	String frenchStatementOfMerit,
	RequestStatusReadModel status,

	//
	// tombstone fields
	//
	@Schema(accessMode = AccessMode.READ_ONLY)
	Long id,
	@Schema(accessMode = AccessMode.READ_ONLY)
	String createdBy,
	@Schema(accessMode = AccessMode.READ_ONLY)
	Instant createdDate,
	@Schema(accessMode = AccessMode.READ_ONLY)
	String lastModifiedBy,
	@Schema(accessMode = AccessMode.READ_ONLY)
	Instant lastModifiedDate
) {}
