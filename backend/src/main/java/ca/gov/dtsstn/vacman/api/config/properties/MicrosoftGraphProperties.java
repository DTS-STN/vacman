package ca.gov.dtsstn.vacman.api.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Microsoft Graph API integration.
 *
 * These properties configure the base URL and other settings for Microsoft Graph API calls.
 * The bearer token is retrieved from the Spring Security context for each request.
 */
@ConfigurationProperties("application.microsoft-graph")
public record MicrosoftGraphProperties(
    /**
     * The base URL for Microsoft Graph API calls.
     * Default: https://graph.microsoft.com/v1.0
     */
    String baseUrl
) {

    /**
     * Default constructor with fallback values.
     */
    public MicrosoftGraphProperties() {
        this("https://graph.microsoft.com/v1.0");
    }
}
