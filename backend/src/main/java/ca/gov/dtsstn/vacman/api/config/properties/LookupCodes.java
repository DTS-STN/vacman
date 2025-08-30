package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("codes")
public record LookupCodes(
	@NestedConfigurationProperty ProfileStatuses profileStatuses,
	@NestedConfigurationProperty UserTypes userTypes
) {

	@Validated
	public record ProfileStatuses(
		@NotBlank String approved,
		@NotBlank String archived,
		@NotBlank String incomplete,
		@NotBlank String pending
	) {}

	@Validated
	public record UserTypes(
		@NotBlank String employee,
		@NotBlank String hrAdvisor
	) {}

}

