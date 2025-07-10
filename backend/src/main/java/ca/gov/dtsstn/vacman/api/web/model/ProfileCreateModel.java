package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "ProfileCreate")
public record ProfileCreateModel(
	@Schema(description = "ID of the user who approved this profile.", example = "1")
	Long approvedByUserId,

	@Schema(description = "City code where the user is located.", example = "OTT")
	String cityCode,

	@Schema(description = "Classification code for the user.", example = "CS-02")
	String classificationCode,

	@Schema(description = "Additional comments about the profile.", example = "Interested in remote work")
	String comment,

	@Schema(description = "Education level code.", example = "BACH")
	String educationLevelCode,

	@Schema(description = "Whether the user has accepted privacy terms.", example = "true")
	Boolean hasAcceptedPrivacyTerms,

	@Schema(description = "Whether the user is available for referral.", example = "true")
	Boolean isAvailableForReferral,

	@Schema(description = "Whether the user is interested in alternation.", example = "false")
	Boolean isInterestedInAlternation,

	@Schema(description = "Language code.", example = "EN")
	String languageCode,

	@Schema(description = "Personal email address.", example = "john.doe@example.com")
	String personalEmailAddress,

	@Schema(description = "Personal phone number.", example = "613-555-1234")
	String personalPhoneNumber,

	@Schema(description = "Priority level code.", example = "HIGH")
	String priorityLevelCode,

	@NotNull(message = "Profile status code is required.")
	@Schema(description = "Profile status code.", example = "ACTIVE")
	String profileStatusCode,

	@Schema(description = "ID of the user who reviewed this profile.", example = "1")
	Long reviewedByUserId,

	@NotNull(message = "User ID is required.")
	@Schema(description = "ID of the user this profile belongs to.", example = "2")
	Long userId,

	@Schema(description = "WFA status code.", example = "APPROVED")
	String wfaStatusCode,

	@Schema(description = "Work unit code.", example = "ITSB")
	String workUnitCode
) {}
