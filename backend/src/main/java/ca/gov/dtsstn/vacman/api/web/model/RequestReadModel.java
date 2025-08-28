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

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Selection Process Number of this request.", example = "12345")
	String selectionProcessNumber,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Workforce Management Approved of this request.")
	Boolean workforceMgmtApprovalRecvd,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Priority Entitlement of this request.")
	Boolean priorityEntitlement,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Priority Entitlement Rationale of this request.")
	String priorityEntitlementRationale,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Selection Process Type of this request.")
	SelectionProcessTypeReadModel selectionProcessType,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Has the person proposed previously performed the same duties in the last twelve months or is this person still currently performing them in any capacity?")
	Boolean hasPerformedSameDuties,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Reason for the appointment from a non-advertised process of this request.")
	NonAdvertisedAppointmentReadModel appointmentNonAdvertised,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Scheduled start date of this request.")
	LocalDate projectedStartDate,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Scheduled end date of this request.")
	LocalDate projectedEndDate,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Work Schedule of this request.")
	WorkScheduleReadModel workSchedule,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Is Employment Equity required in this request.")
	Boolean equityNeeded,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "List of Employment Equity identified of this request.")
	Collection<EmploymentEquityReadModel> employmentEquities,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Position numbers of this request. Comma separated list of position numbers.", example = "12345, 67890")
	String positionNumber,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Classification of this request.")
	ClassificationReadModel classification,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "English title of this request.", example = "Software Engineer")
	String englishTitle,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "French title of this request.", example = "Ingénieur informatique")
	String frenchTitle,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "City of this request.")
	Collection<CityReadModel> cities,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Language requirement of this request.")
	LanguageRequirementReadModel languageRequirement,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "English language profile of this request.")
	String englishLanguageProfile,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "French language profile of this request.")
	String frenchLanguageProfile,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Security clearance required of this request.")
	SecurityClearanceReadModel securityClearance,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "English SOMC of this request.")
	String englishStatementOfMerit,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "French SOMC of this request.")
	String frenchStatementOfMerit,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Status of this request.")
	RequestStatusReadModel status,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Work Unit of this request.")
	WorkUnitReadModel workUnit,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "User that submitted of this request.")
	UserReadModel submitter,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Hiring Manager user of this request.")
	UserReadModel hiringManager,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Sub Delegated user of this request.")
	UserReadModel subDelegatedManager,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "HR Advisor that picked up this request.")
	UserReadModel hrAdvisor,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Language of Correspondence for this request.")
	LanguageReadModel languageOfCorrespondence,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Employment Tenure")
	EmploymentTenureReadModel employmentTenure,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The Clearance number generated by VacMan.", example = "???")
	String priorityClearanceNumber,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The Clearance number received from PSC.", example = "???")
	String pscClearanceNumber,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The request number.", example = "123-111")
	String requestNumber,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Additional comments on this request.", example = "One cool request.")
	String additionalComment,

	//
	// tombstone fields
	//

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this profile.", example = "1")
	Long id,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The user or service that created this request.", example = "vacman-api")
	String createdBy,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The time this request was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The request or service that last modified this request.", example = "vacman-api")
	String lastModifiedBy,

	@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The time this request was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate
) {}