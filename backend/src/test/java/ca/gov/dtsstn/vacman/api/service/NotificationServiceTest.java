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
import ca.gov.dtsstn.vacman.api.service.email.data.EmailTemplateModel;
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
		lenient().when(mockEmailContent.subject()).thenReturn("Test Subject");
		lenient().when(mockEmailContent.body()).thenReturn("Test Body");
		lenient().when(emailTemplateService.processEmailTemplate(any(), any(), any())).thenReturn(mockEmailContent);

		// Mock generic template ID
		lenient().when(applicationProperties.gcnotify().genericTemplateId()).thenReturn("generic-template-id");

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
			NotificationService.RequestEvent.SUBMITTED,
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
			NotificationService.RequestEvent.SUBMITTED,
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
			NotificationService.RequestEvent.SUBMITTED,
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
			NotificationService.RequestEvent.SUBMITTED,
			lookupCodes.languages().french());

		assertThat(result).isNotNull();
		assertThat(result.size()).isEqualTo(2);
	}

	@Test
	@DisplayName("Test send Profile archived email")
	void sendProfileArchivedEmailSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			"test@example.com",
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().english(),
			ProfileStatus.ARCHIVED);

		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send Profile notification to multiple emails")
	void sendProfileNotificationMultipleSuccess() {
		when(restTemplate.postForObject(eq("/email"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		final var result = notificationService.sendProfileNotification(
			List.of("test1@example.com", "test2@example.com"),
			"00000000-0000-0000-0000-000000000000",
			"Ana de Armas",
			lookupCodes.languages().english(),
			ProfileStatus.APPROVED);

		assertThat(result).isNotNull();
		assertThat(result.size()).isEqualTo(2);
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with English language")
	void sendBulkJobOpportunityNotificationEnglishSuccess() {
		// Mock the response from the REST template
		when(restTemplate.postForObject(eq("/bulk"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		// Create test data
		final var recipientEmails = List.of("test1@example.com", "test2@example.com");
		final Long requestId = 123L;
		final var requestTitle = "Test Job Opportunity";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = lookupCodes.languages().english();

		// Call the method being tested
		final var result = notificationService.sendBulkJobOpportunityNotification(
			recipientEmails,
			requestId,
			requestTitle,
			jobModel,
			language
		);

		// Verify the result
		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with French language")
	void sendBulkJobOpportunityNotificationFrenchSuccess() {
		// Mock the response from the REST template
		when(restTemplate.postForObject(eq("/bulk"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		// Create test data
		final var recipientEmails = List.of("test1@example.com", "test2@example.com");
		final Long requestId = 123L;
		final var requestTitle = "Test d'opportunité d'emploi";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Développeur de logiciels",
			"CS-03",
			"Bilingue",
			"Ottawa",
			"Secret",
			"Jean Dupont",
			"jean.dupont@example.com",
			true,
			"Expérience avec Java"
		);
		final var language = lookupCodes.languages().french();

		// Call the method being tested
		final var result = notificationService.sendBulkJobOpportunityNotification(
			recipientEmails,
			requestId,
			requestTitle,
			jobModel,
			language
		);

		// Verify the result
		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with single recipient")
	void sendBulkJobOpportunityNotificationSingleRecipientSuccess() {
		// Mock the response from the REST template
		when(restTemplate.postForObject(eq("/bulk"), any(Map.class), eq(NotificationReceipt.class)))
			.thenReturn(ImmutableNotificationReceipt.builder().build());

		// Create test data with a single recipient
		final var recipientEmails = List.of("single@example.com");
		final Long requestId = 123L;
		final var requestTitle = "Test Job Opportunity";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = lookupCodes.languages().english();

		// Call the method being tested
		final var result = notificationService.sendBulkJobOpportunityNotification(
			recipientEmails,
			requestId,
			requestTitle,
			jobModel,
			language
		);

		// Verify the result
		assertThat(result).isNotNull();
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with empty recipient list")
	void sendBulkJobOpportunityNotificationEmptyRecipientList() {
		// Create test data with an empty recipient list
		final List<String> recipientEmails = List.of();
		final Long requestId = 123L;
		final var requestTitle = "Test Job Opportunity";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = lookupCodes.languages().english();

		// Verify that an IllegalArgumentException is thrown
		org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
			notificationService.sendBulkJobOpportunityNotification(
				recipientEmails,
				requestId,
				requestTitle,
				jobModel,
				language
			);
		});
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with null requestId")
	void sendBulkJobOpportunityNotificationNullRequestId() {
		// Create test data with a null requestId
		final var recipientEmails = List.of("test@example.com");
		final Long requestId = null;
		final var requestTitle = "Test Job Opportunity";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = lookupCodes.languages().english();

		// Verify that an IllegalArgumentException is thrown
		org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
			notificationService.sendBulkJobOpportunityNotification(
				recipientEmails,
				requestId,
				requestTitle,
				jobModel,
				language
			);
		});
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with blank requestTitle")
	void sendBulkJobOpportunityNotificationBlankRequestTitle() {
		// Create test data with a blank requestTitle
		final var recipientEmails = List.of("test@example.com");
		final Long requestId = 123L;
		final var requestTitle = "";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = lookupCodes.languages().english();

		// Verify that an IllegalArgumentException is thrown
		org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
			notificationService.sendBulkJobOpportunityNotification(
				recipientEmails,
				requestId,
				requestTitle,
				jobModel,
				language
			);
		});
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with null jobModel")
	void sendBulkJobOpportunityNotificationNullJobModel() {
		// Create test data with a null jobModel
		final var recipientEmails = List.of("test@example.com");
		final Long requestId = 123L;
		final var requestTitle = "Test Job Opportunity";
		final EmailTemplateModel.JobOpportunity jobModel = null;
		final var language = lookupCodes.languages().english();

		// Verify that an IllegalArgumentException is thrown
		org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
			notificationService.sendBulkJobOpportunityNotification(
				recipientEmails,
				requestId,
				requestTitle,
				jobModel,
				language
			);
		});
	}

	@Test
	@DisplayName("Test send bulk job opportunity notification with blank language")
	@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
	void sendBulkJobOpportunityNotificationBlankLanguage() {
		// Create test data with a blank language
		final var recipientEmails = List.of("test@example.com");
		final Long requestId = 123L;
		final var requestTitle = "Test Job Opportunity";
		final var jobModel = new EmailTemplateModel.JobOpportunity(
			"REQ-123",
			"Software Developer",
			"CS-03",
			"Bilingual",
			"Ottawa",
			"Secret",
			"John Doe",
			"john.doe@example.com",
			true,
			"Experience with Java"
		);
		final var language = "";

		// Verify that an IllegalArgumentException is thrown
		org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
			notificationService.sendBulkJobOpportunityNotification(
				recipientEmails,
				requestId,
				requestTitle,
				jobModel,
				language
			);
		});
	}
}
