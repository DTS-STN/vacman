package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("codes")
public record LookupCodes(
	@NestedConfigurationProperty Languages languages,
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
	public record ProfileStatuses(
		@NotBlank String approved,
		@NotBlank String archived,
		@NotBlank String incomplete,
		@NotBlank String pending
	) {}

	@Validated
	public record RequestStatuses(
		@NotBlank String cancelled,
		@NotBlank String clrGranted,
		@NotBlank String draft,
		@NotBlank String fdbkPending,
		@NotBlank String fdbkPendAppr,
		@NotBlank String hrReview,
		@NotBlank String noMatchHrReview,
		@NotBlank String pendingPsc,
		@NotBlank String pendingPscNoVms,
		@NotBlank String pscGranted,
		@NotBlank String submit
	) {}

	@Validated
	public record UserTypes(
		@NotBlank String employee,
		@NotBlank String hrAdvisor
	) {}

}

