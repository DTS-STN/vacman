package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
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
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
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

	@Mock
	LookupCodes lookupCodes;

	@Mock
	EmailTemplateService emailTemplateService;

	NotificationService notificationService;

	@BeforeEach
	void beforeEach() {
		when(applicationProperties.gcnotify()).thenReturn(mock(GcNotifyProperties.class));
		when(applicationProperties.gcnotify().apiKey()).thenReturn("test-api-key");
		when(applicationProperties.gcnotify().baseUrl()).thenReturn("https://notification.example.com/notifications/email");
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
		lenient().when(languages.english()).thenReturn("en");
		lenient().when(languages.french()).thenReturn("fr");

		// Mock EmailTemplateService
		final var mockEmailContent = mock(EmailTemplateService.EmailContent.class);
		when(mockEmailContent.subject()).thenReturn("Test Subject");
		when(mockEmailContent.body()).thenReturn("Test Body");
		when(emailTemplateService.processEmailTemplate(any(), any(), any())).thenReturn(mockEmailContent);

		// Mock generic template ID
		when(applicationProperties.gcnotify().genericTemplateId()).thenReturn("generic-template-id");

		this.notificationService = new NotificationService(applicationProperties, restTemplateBuilder, lookupCodes, emailTemplateService);
	}

	@Test
	@DisplayName("Test send Profile approved email English")
	void getemailProfileApprovedEnglishSuccess() {
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

	@Test
	@DisplayName("Test send Request notification English")
	void sendRequestNotificationEnglishSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendRequestNotification(
			"test@example.com",
			123L,
			"Test Request",
			NotificationService.RequestEvent.CREATED,
			lookupCodes.languages().english());

		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send Request notification French")
	void sendRequestNotificationFrenchSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendRequestNotification(
			"test@example.com",
			123L,
			"Test Request",
			NotificationService.RequestEvent.CREATED,
			lookupCodes.languages().french());

		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send Request notification to multiple emails with English language")
	void sendRequestNotificationMultipleEnglishSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendRequestNotification(
			List.of("test1@example.com", "test2@example.com"),
			123L,
			"Test Request",
			NotificationService.RequestEvent.CREATED,
			lookupCodes.languages().english());

		assertThat(result).isNotNull();
		assertThat(result.size()).isEqualTo(2);
	}

	@Test
	@DisplayName("Test send Request notification to multiple emails with French language")
	void sendRequestNotificationMultipleFrenchSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendRequestNotification(
			List.of("test1@example.com", "test2@example.com"),
			123L,
			"Test Request",
			NotificationService.RequestEvent.CREATED,
			lookupCodes.languages().french());

		assertThat(result).isNotNull();
		assertThat(result.size()).isEqualTo(2);
	}

}
