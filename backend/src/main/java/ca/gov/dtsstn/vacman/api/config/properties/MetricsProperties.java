package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.metrics")
public record MetricsProperties(
	/**
	 * The deployment environment name used for metric tagging.
	 * This helps distinguish metrics across different environments (e.g., development, staging, production).
	 */
	@NotBlank String environmentName,
	/**
	 * The service name used for metric tagging.
	 * This identifies the service in monitoring dashboards and metric collections.
	 */
	@NotBlank String serviceName
) {}