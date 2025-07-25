package ca.gov.dtsstn.vacman.api.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.MicrosoftGraphService;
import ca.gov.dtsstn.vacman.api.web.model.MicrosoftGraphUserModel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for Microsoft Graph API integration.
 *
 * This controller provides endpoints to retrieve user information from Microsoft Graph
 * using the authenticated user's bearer token from the security context.
 */
@RestController
@Tag(name = "Microsoft Graph", description = "Microsoft Graph API integration endpoints")
@RequestMapping("/api/v1/msgraph")
public class MicrosoftGraphController {

    private static final Logger log = LoggerFactory.getLogger(MicrosoftGraphController.class);

    private final MicrosoftGraphService microsoftGraphService;

    /**
     * Constructor for Microsoft Graph Controller.
     *
     * @param microsoftGraphService Service for Microsoft Graph operations
     */
    public MicrosoftGraphController(MicrosoftGraphService microsoftGraphService) {
        this.microsoftGraphService = microsoftGraphService;
    }

    /**
     * Retrieves the current authenticated user's information from Microsoft Graph.
     *
     * This endpoint uses the bearer token from the security context to fetch
     * user profile information from Microsoft Graph API.
     *
     * @return MicrosoftGraphUserModel containing user information
     */
    @GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(
        summary = "Get current user information from Microsoft Graph",
        description = "Retrieves the authenticated user's profile information from Microsoft Graph API. " +
                    "The bearer token is automatically extracted from the security context."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User information retrieved successfully",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = MicrosoftGraphUserModel.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Invalid or missing authentication token",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - Insufficient permissions to access Microsoft Graph",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error - Failed to retrieve user information",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
        )
    })
    public MicrosoftGraphUserModel getCurrentUser() {
        return microsoftGraphService.getCurrentUser();
    }

    /**
     * Exception handler for RestClientException.
     *
     * @param ex the RestClientException
     * @return ResponseEntity with error status
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<String> handleRestClientException(RestClientException ex) {
        log.error("Microsoft Graph API error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to retrieve user information from Microsoft Graph");
    }

    /**
     * Exception handler for IllegalStateException.
     *
     * @param ex the IllegalStateException
     * @return ResponseEntity with error status
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        log.error("Authentication context error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Authentication context is not available or invalid");
    }
}
