package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("application.flyway")
public record FlywayProperties(
	/**
	 * When true, Flyway will drop all objects (tables, views, procedures, triggers, ...)
	 * in the configured schemas whenever a schema validation fails.
	 */
	boolean cleanOnValidationError
) {}
