package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "ProfileCreate")
public record ProfileCreateModel(
	@NotNull(message = "User ID is required.")
	@Schema(description = "ID of the user this profile belongs to.", example = "2")
	Long userId,

	@NotNull(message = "HR Advisor User ID is required.")
	@Schema(description = "ID of the HR Advisor for this profile.", example = "1")
	Long hrAdvisorUserId,

	@Schema(description = "WFA status code.", example = "AFFECTED")
	String wfaStatusCode,

	@Schema(description = "Classification code for the user.", example = "AS-03")
	String classificationCode,

	@Schema(description = "City code where the user is located.", example = "ON52")
	String cityCode,

	@Schema(description = "Priority level code.", example = "HIGH")
	String priorityLevelCode,

	@Schema(description = "Work unit code.", example = "LABOUR")
	String workUnitCode,

	@Schema(description = "Language ID.", example = "1")
	Long languageId,

	@NotNull(message = "Profile status ID is required.")
	@Schema(description = "Profile status ID.", example = "1")
	Long profileStatusId,

	@Schema(description = "Personal phone number.", example = "613-555-1234")
	String personalPhoneNumber,

	@Schema(description = "Personal email address.", example = "john.doe@example.com")
	String personalEmailAddress,

	@Schema(description = "Whether the user has given privacy consent.", example = "true")
	Boolean privacyConsentInd,

	@Schema(description = "Whether the user is available for referral.", example = "true")
	Boolean availableForReferralInd,

	@Schema(description = "Whether the user is interested in alternation.", example = "false")
	Boolean interestedInAlternationInd,

	@Schema(description = "Additional comments about the profile.", example = "Interested in remote work")
	String additionalComment
) {}
