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
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.GcNotifyProperties;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;
import ca.gov.dtsstn.vacman.api.service.notify.UserProfileStatus;


@DisplayName("NotificationService tests")
@ExtendWith({ MockitoExtension.class })
class NotificationServiceTest {
 
  	@Mock
	RestTemplate restTemplate;

    NotificationService notificationService;

	@BeforeEach
	void beforeEach() {
        final var gcNotifyProperties = mock(GcNotifyProperties.class);
        when(gcNotifyProperties.notifyApiKey()).thenReturn("test-api-key");
        when(gcNotifyProperties.baseUrl()).thenReturn("https://api.notification.canada.ca/v2/notifications/email");
        when(gcNotifyProperties.emailProfileCreated()).thenReturn("00000000-0000-0000-0000-000000000000");
        when(gcNotifyProperties.emailProfileUpdated()).thenReturn("00000000-0000-0000-0000-000000000000");
        when(gcNotifyProperties.emailProfileApproved()).thenReturn("00000000-0000-0000-0000-000000000000");
        when(gcNotifyProperties.connectTimeout()).thenReturn(Duration.ofSeconds(10));
        when(gcNotifyProperties.readTimeout()).thenReturn(Duration.ofSeconds(10));

		final var restTemplateBuilder = mock(RestTemplateBuilder.class);
		when(restTemplateBuilder.rootUri(anyString())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.connectTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.readTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.interceptors(any(ClientHttpRequestInterceptor.class))).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplate);

		this.notificationService = new NotificationService(gcNotifyProperties, restTemplateBuilder);
	}

	@Test
	@DisplayName("Test send Profile created email")
	void getemailProfileCreatedSuccess() {
        
		final var userProfileCreated = mock(UserProfileStatus.class);
		when(userProfileCreated.getEmail()).thenReturn("test@test.com");
		when(userProfileCreated.getProfileId()).thenReturn("http://url/00000000-0000-0000-0000-000000000000");
		when(userProfileCreated.getUsername()).thenReturn("Ana de Armas");

		final var result = notificationService.sendEmailNotification( userProfileCreated, ProfileStatus.CREATED);

		assertThat(result).isEqualTo(notificationService);
	}    

    @Test
	@DisplayName("Test send Profile updated email")
	void getemailProfileUpdatedSuccess() {
        
		final var userProfileCreated = mock(UserProfileStatus.class);
		when(userProfileCreated.getEmail()).thenReturn("test@test.com");
		when(userProfileCreated.getProfileId()).thenReturn("http://url/00000000-0000-0000-0000-000000000000");
		when(userProfileCreated.getUsername()).thenReturn("Ana de Armas");

		final var result = notificationService.sendEmailNotification( userProfileCreated, ProfileStatus.UPDATED);

		assertThat(result).isEqualTo(notificationService);
	}    

    @Test
	@DisplayName("Test send Profile approved email")
	void getemailProfileApprovedSuccess() {
        
		final var userProfileCreated = mock(UserProfileStatus.class);
		when(userProfileCreated.getEmail()).thenReturn("test@test.com");
		when(userProfileCreated.getProfileId()).thenReturn("http://url/00000000-0000-0000-0000-000000000000");
		when(userProfileCreated.getUsername()).thenReturn("Ana de Armas");

		final var result = notificationService.sendEmailNotification( userProfileCreated, ProfileStatus.APPROVED);

		assertThat(result).isEqualTo(notificationService);
	}    

}
