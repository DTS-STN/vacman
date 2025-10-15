package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("codes")
public record LookupCodes(
	@NestedConfigurationProperty Languages languages,
	@NestedConfigurationProperty LanguageReferralTypes languageReferralTypes,
	@NestedConfigurationProperty LanguageRequirements languageRequirements,
	@NestedConfigurationProperty MatchStatuses matchStatuses,
	@NestedConfigurationProperty ProfileStatuses profileStatuses,
	@NestedConfigurationProperty RequestStatuses requestStatuses,
	@NestedConfigurationProperty UserTypes userTypes
) {

	@Validated
	public record Languages(
		@NotBlank String english,
		@NotBlank String french
	) {}

	@Validated
	public record LanguageReferralTypes(
		@NotBlank String bilingual,
		@NotBlank String english,
		@NotBlank String french
	) {}

	@Validated
	public record LanguageRequirements(
		@NotBlank String bilingualImperative,
		@NotBlank String bilingualNonImperative,
		@NotBlank String englishEssential,
		@NotBlank String frenchEssential,
		@NotBlank String eitherOr,
		@NotBlank String various
	) {}

	@Validated
	public record MatchStatuses(
		@NotBlank String approved,
		@NotBlank String inProgress,
		@NotBlank String pendingApproval
	) {}

	@Validated
	public record ProfileStatuses(
		@NotBlank String approved,
		@NotBlank String archived,
		@NotBlank String incomplete,
		@NotBlank String pending
	) {}

	@Validated
	public record RequestStatuses(
		@NotBlank String cancelled,
		@NotBlank String clearanceGranted,
		@NotBlank String draft,
		@NotBlank String feedbackPending,
		@NotBlank String feedbackPendingApproval,
		@NotBlank String hrReview,
		@NotBlank String noMatchHrReview,
		@NotBlank String pendingPscClearance,
		@NotBlank String pendingPscClearanceNoVms,
		@NotBlank String pscClearanceGranted,
		@NotBlank String submitted
	) {}

	@Validated
	public record UserTypes(
		@NotBlank String employee,
		@NotBlank String hrAdvisor
	) {}

}

