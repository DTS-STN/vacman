package ca.gov.dtsstn.vacman.api.event.listener;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;

/**
 * Listener for request-related events.
 */
@Component
public class RequestEventListener {

	private static final Logger log = LoggerFactory.getLogger(RequestEventListener.class);

	private final NotificationService notificationService;

	public RequestEventListener(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	/**
	 * Handles the RequestFeedbackCompletedEvent and sends a notification to the HR advisor.
	 * The notification is sent to the HR advisor's business email address.
	 * If no HR advisor or business email address is found, a warning is logged.
	 */
	@Async
	@EventListener({ RequestFeedbackCompletedEvent.class })
	public void sendRequestFeedbackCompletedNotification(RequestFeedbackCompletedEvent event) {
		final var request = event.entity();

		Optional.ofNullable(request.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.ifPresentOrElse(
				email -> notificationService.sendRequestNotification(email, event.entity().getId(), event.entity().getNameEn(), RequestEvent.FEEDBACK_COMPLETED),
				() -> log.warn("No HR advisor or business email address found for request ID: [{}]", event.entity().getId()));

	}

}
