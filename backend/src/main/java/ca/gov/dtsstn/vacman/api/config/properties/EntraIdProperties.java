package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.entra-id")
public record EntraIdProperties(
	@NotBlank String clientId,
	@NotBlank String principalClaimName,
	@NestedConfigurationProperty RolesProperties roles,
	@NotBlank String rolesClaimName,
	@NotBlank String tenantId
) {

	@Validated
	public record RolesProperties(
		@NotBlank String hrAdvisor
	) {}

}
