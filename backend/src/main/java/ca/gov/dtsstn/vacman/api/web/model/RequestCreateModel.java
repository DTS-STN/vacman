package ca.gov.dtsstn.vacman.api.web.model;

import java.time.LocalDate;
import java.util.Collection;

import ca.gov.dtsstn.vacman.api.web.validator.ValidClassificationCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidEmploymentEquityCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageRequirementCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidNonAdvertisedAppointmentCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidProvinceCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidSelectionProcessTypeCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidWorkScheduleCode;
import io.soabase.recordbuilder.core.RecordBuilderFull;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RecordBuilderFull
@Schema(name = "RequestCreate")
public record RequestCreateModel(
	/// XXX ::: GjB ::: what sort of validation should be done here (if any)?
	@Schema(description = "The selection process number", example = "0000-0000-00")
	@Size(max = 30, message = "The selection process number must not exceed 30 characters")
	String selectionProcessNumber,

	@Schema(description = "If approval has been received from workforce management")
	Boolean workforceManagementApproved,

	@NotNull(message = "Priority entitlement flag is required")
	@Schema(description = "If appointment will result in a priority entitlement")
	Boolean priorityEntitlement,

	@Size(max = 200, message = "The priority entitlement rationale must not exceed 200 characters")
	@Schema(description = "Rationale for potential priority entitlement", example = "Some rationale")
	String priorityEntitlementRationale,

	@NotNull(message = "The selection process type ID is required")
	@ValidSelectionProcessTypeCode(message = "Selection process type ID not found")
	@Schema(description = "The selection process type id", example = "1")
	Long selectionProcessTypeId,

	@NotNull(message = "Performed same duties flag is required")
	@Schema(description = "If the person has performed similar duties in the past")
	Boolean performedSameDuties,

	@NotNull(message = "Non-advertised appoinment reason ID is required")
	@Schema(description = "The non-advertised appoinment reason ID", example = "1")
	@ValidNonAdvertisedAppointmentCode(message = "Non-advertised appoinment reason ID not found")
	Long nonAdvertisedAppointmentId,

	@NotNull(message = "Projected start date is required")
	@Schema(description = "The projected start date", example = "2000-01-01")
	LocalDate projectedStartDate,

	@Future(message = "Projected end date must be in the future")
	@Schema(description = "The projected end date", example = "2100-01-01")
	LocalDate projectedEndDate,

	@NotNull(message = "Work schedule ID is required")
	@ValidWorkScheduleCode(message = "Work schedule ID not found")
	@Schema(description = "The work schedule ID", example = "1")
	Long workScheduleId,

	@NotNull(message = "Equity needed flag is required")
	@Schema(description = "Is there a need for employment equity")
	Boolean equityNeeded,

	@Valid
	@ArraySchema(
		schema = @Schema(type = "string", example = "1"),
		arraySchema = @Schema(description = "The employment equity IDs"))
	Collection<@ValidEmploymentEquityCode(message = "One or more employment equity IDs not found") Long> employmentEquityIds,

	@Valid
	@NotEmpty(message = "At least one position number must be provided")
	@ArraySchema(
		schema = @Schema(type = "string", example = "0000-0000-00"),
		arraySchema = @Schema(description = "The position numbers"))
	Collection<@Size(max = 100, message = "One or more position numbers exceeds 100 characters") String> positionNumbers,

	@NotNull(message = "Classification ID is required")
	@ValidClassificationCode(message = "Classification ID not found")
	@Schema(description = "A valid classification ID", example = "1")
	Long classificationId,

	@NotBlank(message = "English title is required")
	@Schema(description = "The English title", example = "IT Technician, Software Solutions")
	@Size(max = 200, message = "The English title must not exceed 200 characters")
	String englishTitle,

	@NotBlank(message = "French title is required")
	@Size(max = 200, message = "The French title must not exceed 200 characters")
	@Schema(description = "The French title", example = "Technicien TI, Developpement d'applications")
	String frenchTitle,

	@NotNull(message = "Province ID is required")
	@ValidProvinceCode(message = "Province ID not found")
	@Schema(description = "The province ID", example = "1")
	Long provinceId,

	@NotNull(message = "Language requirement IDs is required")
	@ValidLanguageRequirementCode(message = "Language requirement IDs not found")
	@Schema(description = "The language requirement IDs", example = "1")
	Collection<Long> languageRequirementIds,

	@NotBlank(message = "English language profile is required")
	@Schema(description = "The English language profile", example = "???")
	String englishLanguageProfile,

	@NotBlank(message = "French language profile is required")
	@Schema(description = "The French language profile", example = "???")
	String frenchLanguageProfile,

	@NotNull(message = "Security clearance ID is required")
	@ValidLanguageRequirementCode(message = "Security clearance ID not found")
	@Schema(description = "The security clearance ID", example = "1")
	Long securityClearanceId,

	@NotBlank(message = "English statement of merit is required")
	@Schema(description = "The English statement of merit", example = "Lorem ipsum dolor sit amet")
	String englishStatementOfMerit,

	@NotBlank(message = "French statement of merit is required")
	@Schema(description = "The French statement of merit", example = "Lorem ipsum dolor sit amet")
	String frenchStatementOfMerit
) {}
