package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.GcNotifyProperties;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;
import ca.gov.dtsstn.vacman.api.service.notify.ImmutableNotificationReceipt;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;


@ExtendWith({ MockitoExtension.class })
@DisplayName("NotificationService tests")
class NotificationServiceTest {

	@Mock
	ApplicationProperties applicationProperties;

	@Mock
	RestTemplate restTemplate;

	NotificationService notificationService;

	@BeforeEach
	void beforeEach() {
		when(applicationProperties.gcnotify()).thenReturn(mock(GcNotifyProperties.class));
		when(applicationProperties.gcnotify().apiKey()).thenReturn("test-api-key");
		when(applicationProperties.gcnotify().baseUrl()).thenReturn("https://api.notification.canada.ca/v2/notifications/email");
		when(applicationProperties.gcnotify().connectTimeout()).thenReturn(Duration.ofSeconds(10));
		when(applicationProperties.gcnotify().readTimeout()).thenReturn(Duration.ofSeconds(10));

		final var restTemplateBuilder = mock(RestTemplateBuilder.class);
		when(restTemplateBuilder.defaultHeader(any(), any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.rootUri(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.connectTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.readTimeout(any())).thenReturn(restTemplateBuilder);
		when(restTemplateBuilder.build()).thenReturn(restTemplate);

		this.notificationService = new NotificationService(applicationProperties, restTemplateBuilder);
	}

	@Test
	@DisplayName("Test send Profile approved email")
	void getemailProfileApprovedSuccess() {
		when(applicationProperties.gcnotify().profileApprovedTemplateId())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendEmailNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			ProfileStatus.APPROVED);

		assertThat(result).isNotNull(); // TODO ::: GjB ::: improve assertion
	}

	@Test
	@DisplayName("Test send Profile created email")
	void getemailProfileCreatedSuccess() {
		when(applicationProperties.gcnotify().profileCreatedTemplateId())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendEmailNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			ProfileStatus.CREATED);

		assertThat(result).isNotNull(); // TODO ::: GjB ::: improve assertion
	}

	@Test
	@DisplayName("Test send Profile updated email")
	void getemailProfileUpdatedSuccess() {
		when(applicationProperties.gcnotify().profileUpdatedTemplateId())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendEmailNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			ProfileStatus.UPDATED);

		assertThat(result).isNotNull(); // TODO ::: GjB ::: improve assertion
	}

}
