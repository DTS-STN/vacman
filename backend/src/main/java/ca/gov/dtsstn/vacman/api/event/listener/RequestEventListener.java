package ca.gov.dtsstn.vacman.api.event.listener;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.event.RequestCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
import ca.gov.dtsstn.vacman.api.event.RequestStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.RequestSubmittedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;

/**
 * Listener for request-related events.
 */
@Component
public class RequestEventListener {

	private static final Logger log = LoggerFactory.getLogger(RequestEventListener.class);

	private final EventRepository eventRepository;
	private final NotificationService notificationService;
	private final ApplicationProperties applicationProperties;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();

	public RequestEventListener(
			EventRepository eventRepository,
			NotificationService notificationService,
			ApplicationProperties applicationProperties) {
		this.eventRepository = eventRepository;
		this.notificationService = notificationService;
		this.applicationProperties = applicationProperties;
	}

	/**
	 * Handles the RequestCreatedEvent and saves it to the event repository.
	 */
	@Async
	@EventListener({ RequestCreatedEvent.class })
	public void handleRequestCreated(RequestCreatedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_CREATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request created - ID: {}", event.entity().getId());
	}

	/**
	 * Handles the RequestUpdatedEvent and saves it to the event repository.
	 */
	@Async
	@EventListener({ RequestUpdatedEvent.class })
	public void handleRequestUpdated(RequestUpdatedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_UPDATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request updated - ID: {}", event.entity().getId());
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

		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse(null);

		Optional.ofNullable(request.getSubmitter())
			.map(this::getEmployeeEmails)
			.filter(emails -> !emails.isEmpty())
			.ifPresentOrElse(
				emails -> {
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
	 * Handles the RequestSubmittedEvent and sends a notification when a request is submitted.
	 */
	@Async
	@EventListener({ RequestSubmittedEvent.class })
	public void handleRequestSubmitted(RequestSubmittedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_SUBMITTED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request submitted - ID: {}, from status: {}, to status: {}",
			event.entity().getId(), event.previousStatusCode(), event.newStatusCode());

		sendSubmittedNotification(event.entity());
	}

	/**
	 * Handles the RequestStatusChangeEvent and sends a notification based on the status change.
	 */
	@Async
	@EventListener({ RequestStatusChangeEvent.class })
	public void handleRequestStatusChange(RequestStatusChangeEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request status changed - ID: {}, from status: {}, to status: {}",
			event.entity().getId(), event.previousStatusCode(), event.newStatusCode());

		final var request = event.entity();
		final var newStatusCode = event.newStatusCode();

		// Determine which users to notify based on the status change
		if ("PENDING_PSC_NO_VMS".equals(newStatusCode)) {
			sendVmsNotRequiredNotification(request);
		} else if ("CLR_GRANTED".equals(newStatusCode)) {
			sendPscNotRequiredNotification(request);
		} else if ("PENDING_PSC".equals(newStatusCode)) {
			sendPscRequiredNotification(request);
		} else if ("CANCELLED".equals(newStatusCode)) {
			sendCancelledNotification(request);
		}
		// Add more status change handlers here as needed
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

		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse(null);

		Optional.ofNullable(request.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.ifPresentOrElse(
				email -> {
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
	 * Handles the RequestCompletedEvent and sends an email notification.
	 * The notification is sent to the submitter, hiring manager, HR delegate, and the HR advisor's business email.
	 */
	@Async
	@EventListener({ RequestCompletedEvent.class })
	public void handleRequestCompleted(RequestCompletedEvent event) throws JsonProcessingException {
		final var request = event.entity();

		eventRepository.save(EventEntity.builder()
			.type("REQUEST_COMPLETED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request completed - ID: {}", request.getId());

		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		// Collect emails from submitter, hiring manager, and HR delegate
		var emails = Stream.<UserEntity>builder();

		Optional.ofNullable(request.getSubmitter()).ifPresent(emails::add);
		Optional.ofNullable(request.getHiringManager()).ifPresent(emails::add);
		Optional.ofNullable(request.getSubDelegatedManager()).ifPresent(emails::add);

		// Get all emails from the users
		final var userEmails = emails.build()
			.flatMap(user -> getEmployeeEmails(user).stream())
			.collect(Collectors.toList());

		// Add HR Advisor's business email if available
		Optional.ofNullable(request.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.filter(StringUtils::hasText)
			.ifPresent(userEmails::add);

		if (userEmails.isEmpty()) {
			log.warn("No email addresses found for request ID: [{}]", request.getId());
			return;
		}

		notificationService.sendRequestNotification(
			userEmails,
			request.getId(),
			request.getNameEn(),
			RequestEvent.COMPLETED,
			language
		);
	}

	/**
	 * Sends a notification when a request is submitted.
	 * The notification is sent to the HR inbox email.
	 * 
	 * @param request The request entity
	 */
	private void sendSubmittedNotification(RequestEntity request) {
		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		final var hrEmail = applicationProperties.gcnotify().hrGdInboxEmail();

		notificationService.sendRequestNotification(
			hrEmail,
			request.getId(),
			request.getNameEn(),
			RequestEvent.SUBMITTED,
			language
		);
	}

	/**
	 * Sends a notification when a request is marked as VMS not required.
	 * The notification is sent to the PIMS SLE team(?) email.
	 * 
	 * @param request The request entity
	 */
	private void sendVmsNotRequiredNotification(RequestEntity request) {
		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		final var pimsEmail = applicationProperties.gcnotify().pimsSleTeamEmail();

		notificationService.sendRequestNotification(
			pimsEmail,
			request.getId(),
			request.getNameEn(),
			RequestEvent.VMS_NOT_REQUIRED,
			language
		);
	}

	/**
	 * Sends a notification when a request is marked as PSC not required.
	 * The notification is sent to the request owner which could be the submitter, 
	 * the hiring manager or the hr delegate. Send email to all 3.
	 * 
	 * @param request The request entity
	 */
	private void sendPscNotRequiredNotification(RequestEntity request) {
		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		// Collect emails from submitter, hiring manager, and HR delegate
		var emails = Stream.<UserEntity>builder();

		Optional.ofNullable(request.getSubmitter()).ifPresent(emails::add);
		Optional.ofNullable(request.getHiringManager()).ifPresent(emails::add);
		Optional.ofNullable(request.getSubDelegatedManager()).ifPresent(emails::add);

		final var allEmails = emails.build()
			.flatMap(user -> getEmployeeEmails(user).stream())
			.toList();

		notificationService.sendRequestNotification(
			allEmails,
			request.getId(),
			request.getNameEn(),
			RequestEvent.PSC_NOT_REQUIRED,
			language
		);
	}

	/**
	 * Sends a notification when a request is marked as PSC required.
	 * The notification is sent to the PIMS team email.
	 * 
	 * @param request The request entity
	 */
	private void sendPscRequiredNotification(RequestEntity request) {
		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		final var pimsEmail = applicationProperties.gcnotify().pimsSleTeamEmail();

		notificationService.sendRequestNotification(
			pimsEmail,
			request.getId(),
			request.getNameEn(),
			RequestEvent.PSC_REQUIRED,
			language
		);
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

	/**
	 * Sends a notification when a request is cancelled.
	 * The notification is sent to the submitter, hiring manager, and HR delegate.
	 * 
	 * @param request The request entity
	 */
	private void sendCancelledNotification(RequestEntity request) {
		final var language = Optional.ofNullable(request.getLanguage())
			.map(LanguageEntity::getCode)
			.orElse("en");

		// Collect emails from submitter, hiring manager, and HR delegate
		var emails = Stream.<UserEntity>builder();

		Optional.ofNullable(request.getSubmitter()).ifPresent(emails::add);
		Optional.ofNullable(request.getHiringManager()).ifPresent(emails::add);
		Optional.ofNullable(request.getSubDelegatedManager()).ifPresent(emails::add);

		final var allEmails = emails.build()
			.flatMap(user -> getEmployeeEmails(user).stream())
			.toList();

		notificationService.sendRequestNotification(
			allEmails,
			request.getId(),
			request.getNameEn(),
			RequestEvent.CANCELLED,
			language
		);
	}
}
