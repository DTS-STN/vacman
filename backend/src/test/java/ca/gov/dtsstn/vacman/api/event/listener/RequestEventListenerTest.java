package ca.gov.dtsstn.vacman.api.event.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.event.RequestCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
import ca.gov.dtsstn.vacman.api.event.RequestSubmittedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;

@ExtendWith({ MockitoExtension.class })
@DisplayName("RequestEventListener tests")
class RequestEventListenerTest {

	@Mock
	NotificationService notificationService;

	@Mock
	EventRepository eventRepository;

	@Mock
	ApplicationProperties applicationProperties;

	@Mock
	MatchRepository matchRepository;

	RequestEventListener requestEventListener;

	@BeforeEach
	void beforeEach() {
		this.requestEventListener = new RequestEventListener(eventRepository, notificationService, applicationProperties, matchRepository);
	}

	@Nested
	@DisplayName("sendRequestFeedbackCompletedNotification()")
	class SendRequestFeedbackCompletedNotification {

		@Test
		@DisplayName("Should send notification when HR advisor has business email")
		void sendNotificationWhenHrAdvisorHasBusinessEmail() {
			final var request = RequestEntity.builder()
				.id(123L)
				.nameEn("Test Request")
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress("hradvisor@example.com")
					.build())
				.build();

			requestEventListener.sendRequestFeedbackCompletedNotification(new RequestFeedbackCompletedEvent(request));

			verify(notificationService).sendRequestNotification(
				eq("hradvisor@example.com"),
				eq(123L),
				eq("Test Request"),
				eq(RequestEvent.FEEDBACK_COMPLETED),
				any()
			);
		}

		@Test
		@DisplayName("Should not send notification when HR advisor is null")
		void shouldNotSendNotificationWhenHrAdvisorIsNull() {
			final var request = RequestEntity.builder()
				.hrAdvisor(null) // intentional
				.build();

			requestEventListener.sendRequestFeedbackCompletedNotification(new RequestFeedbackCompletedEvent(request));

			verify(notificationService, never()).sendRequestNotification(
				any(String.class),
				any(Long.class),
				any(String.class),
				any(RequestEvent.class),
				any()
			);
		}

		@Test
		@DisplayName("Should not send notification when HR advisor business email is null")
		void shouldNotSendNotificationWhenBusinessEmailIsNull() {
			final var request = RequestEntity.builder()
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress(null) // intentional
					.build())
				.build();

			requestEventListener.sendRequestFeedbackCompletedNotification(new RequestFeedbackCompletedEvent(request));

			verify(notificationService, never()).sendRequestNotification(
				any(String.class),
				any(Long.class),
				any(String.class),
				any(RequestEvent.class),
				any()
			);
		}

	}

	@Nested
	@DisplayName("sendRequestFeedbackPendingNotification()")
	class SendRequestFeedbackPendingNotification {

		@Test
		@DisplayName("Should send notification to submitter, hiring manager, and HR delegate when they have business emails")
		void sendNotificationWhenSubmitterHasBusinessEmail() {
			final var request = RequestEntity.builder()
				.id(789L)
				.nameEn("Feedback Pending Request")
				.submitter(UserEntity.builder()
					.businessEmailAddress("submitter@example.com")
					.profiles(List.of())
					.build())
				.hiringManager(UserEntity.builder()
					.businessEmailAddress("hiringmanager@example.com")
					.profiles(List.of())
					.build())
				.subDelegatedManager(UserEntity.builder()
					.businessEmailAddress("hrdelegate@example.com")
					.profiles(List.of())
					.build())
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(
				eq(List.of("submitter@example.com", "hiringmanager@example.com", "hrdelegate@example.com")),
				eq(789L),
				eq("Feedback Pending Request"),
				eq(RequestEvent.FEEDBACK_PENDING),
				any()
			);
		}

		@Test
		@DisplayName("Should send notification to both business and personal emails for all roles")
		void sendNotificationToBothEmails() {
			final var request = RequestEntity.builder()
				.id(999L)
				.nameEn("Multi Email Request")
				.submitter(UserEntity.builder()
					.businessEmailAddress("submitter_business@example.com")
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("submitter_personal@example.com")
						.build()))
					.build())
				.hiringManager(UserEntity.builder()
					.businessEmailAddress("manager_business@example.com")
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("manager_personal@example.com")
						.build()))
					.build())
				.subDelegatedManager(UserEntity.builder()
					.businessEmailAddress("delegate_business@example.com")
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("delegate_personal@example.com")
						.build()))
					.build())
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(
				eq(List.of(
					"submitter_business@example.com", "submitter_personal@example.com",
					"manager_business@example.com", "manager_personal@example.com",
					"delegate_business@example.com", "delegate_personal@example.com"
				)),
				eq(999L),
				eq("Multi Email Request"),
				eq(RequestEvent.FEEDBACK_PENDING),
				any()
			);
		}

		@Test
		@DisplayName("Should still send notification when submitter is null but other roles are present")
		void shouldNotSendNotificationWhenSubmitterIsNull() {
			final var request = RequestEntity.builder()
				.id(555L)
				.nameEn("No Submitter Request")
				.submitter(null) // intentional
				.hiringManager(UserEntity.builder()
					.businessEmailAddress("hiringmanager@example.com")
					.profiles(List.of())
					.build())
				.subDelegatedManager(UserEntity.builder()
					.businessEmailAddress("hrdelegate@example.com")
					.profiles(List.of())
					.build())
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(
				eq(List.of("hiringmanager@example.com", "hrdelegate@example.com")),
				eq(555L),
				eq("No Submitter Request"),
				eq(RequestEvent.FEEDBACK_PENDING),
				any()
			);
		}

		@Test
		@DisplayName("Should not send notification when all roles have no email addresses")
		void shouldNotSendNotificationWhenNoEmailAddresses() {
			final var request = RequestEntity.builder()
				.id(222L)
				.nameEn("No Emails Request")
				.submitter(UserEntity.builder()
					.businessEmailAddress(null) // intentional
					.profiles(List.of())
					.build())
				.hiringManager(UserEntity.builder()
					.businessEmailAddress(null) // intentional
					.profiles(List.of())
					.build())
				.subDelegatedManager(UserEntity.builder()
					.businessEmailAddress(null) // intentional
					.profiles(List.of())
					.build())
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService, never()).sendRequestNotification(
				anyList(),
				any(Long.class),
				any(String.class),
				any(RequestEvent.class),
				any()
			);
		}

		@Test
		@DisplayName("Should send notification to personal emails when business emails are null")
		void sendNotificationToPersonalEmailOnly() {
			final var request = RequestEntity.builder()
				.id(333L)
				.nameEn("Personal Email Only Request")
				.submitter(UserEntity.builder()
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("submitter_personal@example.com")
						.build()))
					.build())
				.hiringManager(UserEntity.builder()
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("manager_personal@example.com")
						.build()))
					.build())
				.subDelegatedManager(UserEntity.builder()
					.profiles(List.of(ProfileEntity.builder()
						.personalEmailAddress("delegate_personal@example.com")
						.build()))
					.build())
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(
				eq(List.of(
					"submitter_personal@example.com",
					"manager_personal@example.com",
					"delegate_personal@example.com"
				)),
				eq(333L),
				eq("Personal Email Only Request"),
				eq(RequestEvent.FEEDBACK_PENDING),
				any()
			);
		}

	}

	@Nested
	@DisplayName("handleRequestCreated()")
	class HandleRequestCreated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var request = RequestEntity.builder()
				.id(456L)
				.build();

			requestEventListener.handleRequestCreated(new RequestCreatedEvent(request));

			verify(eventRepository).save(any(EventEntity.class));
		}
	}

	@Nested
	@DisplayName("handleRequestUpdated()")
	class HandleRequestUpdated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var request = RequestEntity.builder()
				.id(789L)
				.build();

			requestEventListener.handleRequestUpdated(new RequestUpdatedEvent(request));

			verify(eventRepository).save(any(EventEntity.class));
		}
	}

}
