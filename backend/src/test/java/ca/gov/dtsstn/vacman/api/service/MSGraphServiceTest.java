package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.web.client.HttpClientErrorException.NotFound;
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
	void getUserById_success() {
		final var msGraphUser = MSGraphUserBuilder.builder()
			.id("00000000-0000-0000-0000-000000000000")
			.givenName("Test")
			.surname("User")
			.build();

		final var response = new ResponseEntity<Object>(msGraphUser, HttpStatus.OK);
		when(restTemplate.getForEntity(anyString(), any(), anyString(), anyString())).thenReturn(response);

		final var result = msGraphService.getUserById("00000000-0000-0000-0000-000000000000");

		assertThat(result)
			.isPresent()
			.contains(msGraphUser);
	}

	@Test
	@DisplayName("Test getUser() not found")
	void getUserById_notFound() {
		when(restTemplate.getForEntity(anyString(), any(), anyString(), anyString())).thenThrow(NotFound.class);
		final var result = msGraphService.getUserById("00000000-0000-0000-0000-000000000000");
		assertThat(result).isEmpty();
	}

}
