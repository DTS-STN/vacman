package ca.gov.dtsstn.vacman.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.MicrosoftGraphProperties;
import ca.gov.dtsstn.vacman.api.web.model.MicrosoftGraphUserModel;

/**
 * Service for interacting with Microsoft Graph API to retrieve user information.
 *
 * This service uses the bearer token from the Spring Security context to authenticate
 * requests to Microsoft Graph. The token is automatically extracted from the JWT
 * authentication principal.
 */
@Service
public class MicrosoftGraphService {

    private static final Logger log = LoggerFactory.getLogger(MicrosoftGraphService.class);

    // Microsoft Graph user profile endpoint with specific field selection
    private static final String USER_PROFILE_ENDPOINT = "/me?$select=id,onPremisesSamAccountName,givenName,surname,businessPhones,mail,preferredLanguage,city,state,jobTitle,department,officeLocation,mobilePhone";

    private final RestTemplate restTemplate;
    private final MicrosoftGraphProperties properties;

    /**
     * Constructor for Microsoft Graph Service.
     *
     * @param restTemplateBuilder Builder for creating REST template with proper configuration
     * @param properties Microsoft Graph configuration properties
     */
    public MicrosoftGraphService(RestTemplateBuilder restTemplateBuilder, MicrosoftGraphProperties properties) {
        this.properties = properties;
        this.restTemplate = restTemplateBuilder
            .rootUri(properties.baseUrl())
            .connectTimeout(properties.connectTimeout())
            .readTimeout(properties.readTimeout())
            .build();

        log.info("Initialized Microsoft Graph Service with base URL: {}, connect timeout: {}, read timeout: {}",
            properties.baseUrl(), properties.connectTimeout(), properties.readTimeout());
    }

    /**
     * Retrieves the current user's information from Microsoft Graph.
     *
     * This method extracts the bearer token from the Spring Security context
     * and uses it to make an authenticated request to Microsoft Graph.
     *
     * @return MicrosoftGraphUserModel containing user information
     * @throws IllegalStateException if no authentication context is available
     * @throws RestClientException if the Microsoft Graph API call fails
     */
    public MicrosoftGraphUserModel getCurrentUser() {
        log.debug("Retrieving current user information from Microsoft Graph");

        // Extract the bearer token from Spring Security context
        String bearerToken = extractBearerTokenFromContext();

        // Prepare headers with authorization
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(bearerToken);
        headers.set("ConsistencyLevel", "eventual"); // For potential advanced queries

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // Make the request to Microsoft Graph
            log.debug("Making request to Microsoft Graph: {}", USER_PROFILE_ENDPOINT);

            MicrosoftGraphUserModel user = restTemplate.getForObject(
                USER_PROFILE_ENDPOINT,
                MicrosoftGraphUserModel.class,
                entity
            );
            if (user != null) {
                log.info("Successfully retrieved user information for user ID: {}", user.id());
                return user;
            } else {
                log.warn("Microsoft Graph returned null response body");
                throw new RestClientException("Microsoft Graph returned empty response");
            }

        } catch (RestClientException e) {
            log.error("Failed to retrieve user information from Microsoft Graph", e);
            throw new RestClientException("Failed to retrieve user information from Microsoft Graph: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts the bearer token from the Spring Security context.
     *
     * @return The bearer token as a string
     * @throws IllegalStateException if no authentication context is available or token cannot be extracted
     */
    private String extractBearerTokenFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new IllegalStateException("No authentication context available");
        }

        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String tokenValue = jwt.getTokenValue();
            log.debug("Successfully extracted bearer token from JWT principal");
            return tokenValue;
        }

        throw new IllegalStateException("Authentication principal is not a JWT token");
    }
}
