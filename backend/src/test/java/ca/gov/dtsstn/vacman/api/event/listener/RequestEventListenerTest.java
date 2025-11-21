package ca.gov.dtsstn.vacman.api.event.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.event.RequestCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;
import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDtoBuilder;

@ExtendWith({ MockitoExtension.class })
@DisplayName("RequestEventListener tests")
class RequestEventListenerTest {

	@Mock
	ApplicationProperties applicationProperties;

	@Mock
	EventRepository eventRepository;

	@Mock(answer = Answers.RETURNS_DEEP_STUBS)
	LookupCodes lookupCodes;

	@Mock
	MatchRepository matchRepository;

	@Mock
	NotificationService notificationService;

	RequestEventListener requestEventListener;

	@BeforeEach
	void beforeEach() {
		this.requestEventListener = new RequestEventListener(eventRepository, lookupCodes, notificationService, applicationProperties, matchRepository);
	}

	@Nested
	@DisplayName("sendRequestFeedbackCompletedNotification()")
	class SendRequestFeedbackCompletedNotification {

		@Test
		@DisplayName("Should send notification when HR advisor has business email")
		void sendNotificationWhenHrAdvisorHasBusinessEmail() {
			final var request = RequestEventDtoBuilder.builder()
				.id(123L)
				.nameEn("Test Request")
				.hrAdvisorEmail("hradvisor@example.com")
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
			final var request = RequestEventDtoBuilder.builder()
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
			final var request = RequestEventDtoBuilder.builder()
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
			final var request = RequestEventDtoBuilder.builder()
				.id(789L)
				.nameEn("Feedback Pending Request")
				.additionalContactEmails(List.of())
				.submitterEmails(List.of("submitter@example.com"))
				.hiringManagerEmails(List.of("hiringmanager@example.com"))
				.subDelegatedManagerEmails(List.of("hrdelegate@example.com"))
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(eq("submitter@example.com"), eq(789L), eq("Feedback Pending Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
			verify(notificationService).sendRequestNotification(eq("hiringmanager@example.com"), eq(789L), eq("Feedback Pending Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
			verify(notificationService).sendRequestNotification(eq("hrdelegate@example.com"), eq(789L), eq("Feedback Pending Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
		}

		@Test
		@DisplayName("Should send notification to both business and personal emails for all roles")
		void sendNotificationToBothEmails() {
			final var request = RequestEventDtoBuilder.builder()
				.id(999L)
				.nameEn("Multi Email Request")
				.additionalContactEmails(List.of())
				.submitterEmails(List.of("submitter_business@example.com", "submitter_personal@example.com"))
				.hiringManagerEmails(List.of("manager_business@example.com", "manager_personal@example.com"))
				.subDelegatedManagerEmails(List.of("delegate_business@example.com", "delegate_personal@example.com"))
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService, times(6)).sendRequestNotification(any(String.class), eq(999L), eq("Multi Email Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
		}

		@Test
		@DisplayName("Should still send notification when submitter is null but other roles are present")
		void shouldNotSendNotificationWhenSubmitterIsNull() {
			final var request = RequestEventDtoBuilder.builder()
				.id(555L)
				.nameEn("No Submitter Request")
				.additionalContactEmails(List.of())
				.submitterEmails(List.of())
				.hiringManagerEmails(List.of("hiringmanager@example.com"))
				.subDelegatedManagerEmails(List.of("hrdelegate@example.com"))
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService).sendRequestNotification(eq("hiringmanager@example.com"), eq(555L), eq("No Submitter Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
			verify(notificationService).sendRequestNotification(eq("hrdelegate@example.com"), eq(555L), eq("No Submitter Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
		}

		@Test
		@DisplayName("Should not send notification when all roles have no email addresses")
		void shouldNotSendNotificationWhenNoEmailAddresses() {
			final var request = RequestEventDtoBuilder.builder()
				.id(222L)
				.nameEn("No Emails Request")
				.additionalContactEmails(List.of())
				.submitterEmails(List.of())
				.hiringManagerEmails(List.of())
				.subDelegatedManagerEmails(List.of())
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
			final var request = RequestEventDtoBuilder.builder()
				.id(333L)
				.nameEn("Personal Email Only Request")
				.additionalContactEmails(List.of())
				.submitterEmails(List.of("submitter_personal@example.com"))
				.hiringManagerEmails(List.of("manager_personal@example.com"))
				.subDelegatedManagerEmails(List.of("delegate_personal@example.com"))
				.build();

			requestEventListener.sendRequestFeedbackPendingNotification(new RequestFeedbackPendingEvent(request));

			verify(notificationService, times(3)).sendRequestNotification(any(String.class), eq(333L), eq("Personal Email Only Request"), eq(RequestEvent.FEEDBACK_PENDING), any());
		}

	}

	@Nested
	@DisplayName("handleRequestCreated()")
	class HandleRequestCreated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var request = RequestEventDtoBuilder.builder()
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
			final var request = RequestEventDtoBuilder.builder()
				.id(789L)
				.build();

			requestEventListener.handleRequestUpdated(new RequestUpdatedEvent(request));

			verify(eventRepository).save(any(EventEntity.class));
		}
	}

}
