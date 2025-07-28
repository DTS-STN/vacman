package ca.gov.dtsstn.vacman.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.MicrosoftGraphProperties;
import ca.gov.dtsstn.vacman.api.web.model.MicrosoftGraphUserModel;

/**
 * Unit tests for MicrosoftGraphService.
 */
@ExtendWith(MockitoExtension.class)
class MicrosoftGraphServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private Jwt jwt;

    private MicrosoftGraphService microsoftGraphService;
    private MicrosoftGraphProperties properties;

    @BeforeEach
    void setUp() {
        properties = new MicrosoftGraphProperties(
            "https://graph.microsoft.com/v1.0",
            Duration.ofSeconds(10),
            Duration.ofSeconds(30)
        );

        when(restTemplateBuilder.rootUri(anyString())).thenReturn(restTemplateBuilder);
        when(restTemplateBuilder.connectTimeout(any())).thenReturn(restTemplateBuilder);
        when(restTemplateBuilder.readTimeout(any())).thenReturn(restTemplateBuilder);
        when(restTemplateBuilder.build()).thenReturn(restTemplate);

        microsoftGraphService = new MicrosoftGraphService(restTemplateBuilder, properties);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getCurrentUser_Success() {
        // Arrange
        String expectedToken = "mock-bearer-token";
        MicrosoftGraphUserModel expectedUser = new MicrosoftGraphUserModel(
            "test-id",
            "testuser",
            "John",
            "Doe",
            new String[]{"123-456-7890"},
            "john.doe@example.com",
            "en-CA",
            "Ottawa",
            "Ontario",
            "Software Developer",
            "IT",
            "Building A",
            "987-654-3210"
        );

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(jwt);
        when(jwt.getTokenValue()).thenReturn(expectedToken);

        ResponseEntity<MicrosoftGraphUserModel> responseEntity = ResponseEntity.ok(expectedUser);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(MicrosoftGraphUserModel.class)))
            .thenReturn(responseEntity);

        // Act
        MicrosoftGraphUserModel result = microsoftGraphService.getCurrentUser();

        // Assert
        assertNotNull(result);
        assertEquals(expectedUser.id(), result.id());
        assertEquals(expectedUser.mail(), result.mail());
        assertEquals(expectedUser.givenName(), result.givenName());
        assertEquals(expectedUser.surname(), result.surname());

        verify(restTemplate).exchange(
            eq("/me?$select=id,onPremisesSamAccountName,givenName,surname,businessPhones,mail,preferredLanguage,city,state,jobTitle,department,officeLocation,mobilePhone"),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(MicrosoftGraphUserModel.class)
        );
    }

    @Test
    void getCurrentUser_NoAuthentication_ThrowsException() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> microsoftGraphService.getCurrentUser()
        );

        assertEquals("No authentication context available", exception.getMessage());
    }

    @Test
    void getCurrentUser_NonJwtPrincipal_ThrowsException() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("not-a-jwt");

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> microsoftGraphService.getCurrentUser()
        );

        assertEquals("Authentication principal is not a JWT token", exception.getMessage());
    }

    @Test
    void getCurrentUser_RestClientException_ThrowsException() {
        // Arrange
        String expectedToken = "mock-bearer-token";

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(jwt);
        when(jwt.getTokenValue()).thenReturn(expectedToken);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(MicrosoftGraphUserModel.class)))
            .thenThrow(new RestClientException("Graph API error"));

        // Act & Assert
        RestClientException exception = assertThrows(
            RestClientException.class,
            () -> microsoftGraphService.getCurrentUser()
        );

        assertTrue(exception.getMessage().contains("Failed to retrieve user information from Microsoft Graph"));
    }
}
