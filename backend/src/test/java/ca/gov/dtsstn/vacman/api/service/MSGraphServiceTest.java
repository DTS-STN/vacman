package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.MSGraphProperties;
import ca.gov.dtsstn.vacman.api.service.dto.MSGraphUserBuilder;

@DisplayName("MSGraphService tests")
@ExtendWith({ MockitoExtension.class })
class MSGraphServiceTest {

	@Mock
	RestTemplate restTemplate;

	MSGraphService msGraphService;

	@BeforeEach
	void beforeEach() {
		final var applicationProperties = mock(ApplicationProperties.class);
		when(applicationProperties.msGraph()).thenReturn(mock(MSGraphProperties.class));
		when(applicationProperties.msGraph().baseUrl()).thenReturn("https://graph.microsoft.com/v1.0");
		when(applicationProperties.msGraph().connectTimeout()).thenReturn(Duration.ofSeconds(10));
		when(applicationProperties.msGraph().readTimeout()).thenReturn(Duration.ofSeconds(10));

		final var restTemplateBuilder = mock(RestTemplateBuilder.class);
		when(restTemplateBuilder.rootUri(anyString())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.connectTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.readTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.interceptors(any(ClientHttpRequestInterceptor.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplate);

		this.msGraphService = new MSGraphService(applicationProperties, mock(OAuth2AuthorizedClientManager.class), restTemplateBuilder);
	}

	@Test
	@DisplayName("Test getUser() success")
	void getUserSuccess() {
		final var msGraphUser = MSGraphUserBuilder.builder()
			.id("00000000-0000-0000-0000-000000000000")
			.givenName("Test")
			.surname("User")
			.build();

		final var response = new ResponseEntity<Object>(msGraphUser, HttpStatus.OK);
		when(restTemplate.getForEntity(anyString(), any(), anyString(), anyString())).thenReturn(response);

		final var result = msGraphService.getUser("00000000-0000-0000-0000-000000000000");

		assertThat(result)
			.isPresent()
			.contains(msGraphUser);
	}

	@Test
	@DisplayName("Test getUser() not found")
	void getUserNotFound() {
		final var response = new ResponseEntity<Object>(HttpStatus.NOT_FOUND);
		when(restTemplate.getForEntity(anyString(), any(), anyString(), anyString())).thenReturn(response);

		final var result = msGraphService.getUser("00000000-0000-0000-0000-000000000000");

		assertThat(result).isEmpty();
	}

	@Test
	@DisplayName("Test getUser() error")
	void getUserError() {
		final var response = new ResponseEntity<Object>(HttpStatus.INTERNAL_SERVER_ERROR);
		when(restTemplate.getForEntity(anyString(), any(), anyString(), anyString())).thenReturn(response);

		assertThatThrownBy(() -> msGraphService.getUser("00000000-0000-0000-0000-000000000000"))
			.isInstanceOf(RestClientException.class)
			.hasMessage("Unexpected response from MSGraph: 500 INTERNAL_SERVER_ERROR");
	}

}
