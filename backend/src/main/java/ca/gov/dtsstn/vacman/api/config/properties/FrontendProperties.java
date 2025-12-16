package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.frontend")
public record FrontendProperties(
	@NotBlank String baseUrl
) {}