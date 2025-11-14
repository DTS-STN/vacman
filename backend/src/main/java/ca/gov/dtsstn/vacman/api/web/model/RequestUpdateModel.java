package ca.gov.dtsstn.vacman.api.web.model;

import java.time.LocalDate;
import java.util.Collection;

import ca.gov.dtsstn.vacman.api.web.validator.ValidCityCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidClassificationCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidEmploymentEquityCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidEmploymentTenureCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageRequirementCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidNonAdvertisedAppointmentCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidRequestStatusCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidSecurityClearanceCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidSelectionProcessTypeCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidUserId;
import ca.gov.dtsstn.vacman.api.web.validator.ValidWorkScheduleCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidWorkUnitCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@RecordBuilder
@Schema(name = "RequestUpdate")
public record RequestUpdateModel(

	@Size(max = 100)
	String additionalComment,

	@ValidUserId
	Long additionalContactId,

	@Email
	@Size(max = 320)
	String alternateContactEmailAddress,

	@ValidNonAdvertisedAppointmentCode
	Long appointmentNonAdvertisedId,

	@Valid
	Collection<@Valid CityId> cityIds,

	@ValidClassificationCode
	Long classificationId,

	@Valid
	Collection<@Valid EmploymentEquityId> employmentEquityIds,

	@ValidEmploymentTenureCode
	Long employmentTenureId,

	@Size(max = 3)
	String englishLanguageProfile,

	String englishStatementOfMerit,

	@Size(max = 200)
	String englishTitle,

	Boolean equityNeeded,

	@Size(max = 3)
	String frenchLanguageProfile,

	String frenchStatementOfMerit,

	@Size(max = 200)
	String frenchTitle,

	Boolean hasPerformedSameDuties,

	@ValidUserId
	Long hiringManagerId,

	@ValidUserId
	Long hrAdvisorId,

	@ValidLanguageCode
	Long languageOfCorrespondenceId,

	@ValidLanguageRequirementCode
	Long languageRequirementId,

	@Size(max = 100)
	@Pattern(regexp = "^\\d{8}(,\\d{8})*$", message = "Position numbers must be comma-separated eight digit numbers")
	String positionNumbers,

	@Size(max = 200)
	String priorityClearanceNumber,

	Boolean priorityEntitlement,

	@Size(max = 200)
	String priorityEntitlementRationale,

	@Future
	LocalDate projectedEndDate,

	LocalDate projectedStartDate,

	@Size(max = 20)
	String pscClearanceNumber,

	@Size(max = 10)
	String requestNumber,

	@ValidSecurityClearanceCode
	Long securityClearanceId,

	@Size(max = 30)
	String selectionProcessNumber,

	@ValidSelectionProcessTypeCode
	Long selectionProcessTypeId,

	@ValidRequestStatusCode
	Long statusId,

	@ValidUserId
	Long subDelegatedManagerId,

	@ValidUserId
	Long submitterId,

	Boolean teleworkAllowed,

	Boolean workforceMgmtApprovalRecvd,

	@ValidWorkScheduleCode
	Long workScheduleId,

	@ValidWorkUnitCode
	Long workUnitId

) {

	@Valid
	public record CityId(
		@NotNull
		@ValidCityCode
		Long value
	) {}

	@Valid
	public record EmploymentEquityId(
		@NotNull
		@ValidEmploymentEquityCode
		Long value
	) {}

}
