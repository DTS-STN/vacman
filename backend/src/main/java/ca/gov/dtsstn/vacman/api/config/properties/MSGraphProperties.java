package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Microsoft Graph API integration.
 *
 * These properties configure the base URL, timeouts, and other settings for Microsoft Graph API calls.
 * The bearer token is retrieved from the Spring Security context for each request.
 */
@ConfigurationProperties("application.ms-graph")
public record MSGraphProperties(
	/**
	 * The base URL for Microsoft Graph API calls.
	 * Default: https://graph.microsoft.com/v1.0
	 */
	String baseUrl,
	/**
	 * Connection timeout for Microsoft Graph API calls.
	 * Default: 10 seconds
	 */
	Duration connectTimeout,
	/**
	 * Read timeout for Microsoft Graph API calls.
	 * Default: 30 seconds
	 */
	Duration readTimeout
) {}
