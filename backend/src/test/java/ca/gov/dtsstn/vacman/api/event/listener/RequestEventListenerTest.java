package ca.gov.dtsstn.vacman.api.event.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;

@ExtendWith({ MockitoExtension.class })
@DisplayName("RequestEventListener tests")
class RequestEventListenerTest {

	@Mock
	NotificationService notificationService;

	RequestEventListener requestEventListener;

	@BeforeEach
	void beforeEach() {
		this.requestEventListener = new RequestEventListener(notificationService);
	}

	@Test
	@DisplayName("Should send notification when HR advisor has business email")
	void sendNotificationWhenHrAdvisorHasBusinessEmail() {
		final var hrAdvisor = UserEntity.builder()
			.businessEmailAddress("hradvisor@example.com")
			.build();

		final var request = RequestEntity.builder()
			.id(123L)
			.nameEn("Test Request")
			.hrAdvisor(hrAdvisor)
			.build();

		requestEventListener.sendRequestFeedbackCompletedNotification(new RequestFeedbackCompletedEvent(request));

		verify(notificationService).sendRequestNotification(
			eq("hradvisor@example.com"),
			eq(123L),
			eq("Test Request"),
			eq(RequestEvent.FEEDBACK_COMPLETED)
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
			any(RequestEvent.class)
		);
	}

	@Test
	@DisplayName("Should not send notification when HR advisor business email is null")
	void shouldNotSendNotificationWhenBusinessEmailIsNull() {
		final var hrAdvisor = UserEntity.builder()
			.businessEmailAddress(null) // intentional
			.build();

		final var request = RequestEntity.builder()
			.hrAdvisor(hrAdvisor)
			.build();

		requestEventListener.sendRequestFeedbackCompletedNotification(new RequestFeedbackCompletedEvent(request));

		verify(notificationService, never()).sendRequestNotification(
			any(String.class),
			any(Long.class),
			any(String.class),
			any(RequestEvent.class)
		);
	}

}
