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
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.GcNotifyProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;
import ca.gov.dtsstn.vacman.api.service.notify.ImmutableNotificationReceipt;
import ca.gov.dtsstn.vacman.api.service.notify.NotificationReceipt;
import io.micrometer.core.instrument.MeterRegistry;

@ExtendWith({ MockitoExtension.class })
@DisplayName("NotificationService tests")
class NotificationServiceTest {

	@Mock
	ApplicationProperties applicationProperties;

	@Mock
	RestTemplate restTemplate;

	@Mock
	LookupCodes lookupCodes;

	@Mock(answer = Answers.RETURNS_DEEP_STUBS)
	MeterRegistry meterRegistry;

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

		final var languages = mock(LookupCodes.Languages.class);
		when(lookupCodes.languages()).thenReturn(languages);
		when(languages.english()).thenReturn("en");
		// when(languages.french()).thenReturn("fr"); // TODO this line makes the tests fails

		this.notificationService = new NotificationService(applicationProperties, restTemplateBuilder, lookupCodes, meterRegistry);
	}

	@Test
	@DisplayName("Test send Profile approved email English")
	void getemailProfileApprovedEnglishSuccess() {
		when(applicationProperties.gcnotify().profileApprovedTemplateIdEng())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().english(),
			ProfileStatus.APPROVED);

		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send Profile approved email French")
	void getemailProfileApprovedFrenchSuccess() {
		when(applicationProperties.gcnotify().profileApprovedTemplateIdFra())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().french(),
			ProfileStatus.APPROVED);

		assertThat(result).isNotNull();
	}


	@Test
	@DisplayName("Test send Profile pending email English")
	void getemailProfilePendingEnglishSuccess() {
		when(applicationProperties.gcnotify().profilePendingTemplateIdEng())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			"hradvisor@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().english(),
			ProfileStatus.PENDING);

		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send Profile pending email French")
	void getemailProfilePendingFrenchSuccess() {
		when(applicationProperties.gcnotify().profilePendingTemplateIdFra())
			.thenReturn("00000000-0000-0000-0000-000000000000");

		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			"hradvisor@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().french(),
			ProfileStatus.PENDING);

		assertThat(result).isNotNull();
	}

}
