package ca.gov.dtsstn.vacman.api.event.listener;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
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
				email -> {
					final var language = Optional.ofNullable(request.getLanguage())
						.map(LanguageEntity::getCode)
						.orElse(null);

					notificationService.sendRequestNotification(
						email,
						request.getId(),
						request.getNameEn(),
						RequestEvent.FEEDBACK_COMPLETED,
						language
					);
				}, () -> log.warn("No HR advisor or business email address found for request ID: [{}]", event.entity().getId()));
	}

	/**
	 * Handles the RequestFeedbackPendingEvent and sends a notification to the request submitter.
	 * The notification is sent to the submitter's business and/or personal email addresses.
	 * If no submitter or email addresses are found, a warning is logged.
	 */
	@Async
	@EventListener({ RequestFeedbackPendingEvent.class })
	public void sendRequestFeedbackPendingNotification(RequestFeedbackPendingEvent event) {
		final var request = event.entity();

		Optional.ofNullable(request.getSubmitter())
			.map(this::getEmployeeEmails)
			.filter(emails -> !emails.isEmpty())
			.ifPresentOrElse(
				emails -> {
					final var language = Optional.ofNullable(request.getLanguage())
						.map(LanguageEntity::getCode)
						.orElse(null);

					notificationService.sendRequestNotification(
						emails,
						request.getId(),
						request.getNameEn(),
						RequestEvent.FEEDBACK_PENDING,
						language
					);
				}, () -> log.warn("No email addresses found for request ID: [{}]", request.getId()));
	}

	/**
	 * Returns a list of all known emails for the user.
	 */
	private List<String> getEmployeeEmails(UserEntity employee) {
		final var businessEmail = Optional.ofNullable(employee.getBusinessEmailAddress())
			.filter(StringUtils::hasText);

		final var personalEmail = employee.getProfiles().stream()
			.map(ProfileEntity::getPersonalEmailAddress)
			.filter(StringUtils::hasText)
			.findFirst();

		return Stream.of(businessEmail, personalEmail)
			.filter(Optional::isPresent)
			.map(Optional::get)
			.toList();
	}

}
