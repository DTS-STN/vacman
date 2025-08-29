package ca.gov.dtsstn.vacman.api.event.listener;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.ProfileStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;

/**
 * Listener for profile-related events.
 */
@Component
public class ProfileEventListener {

	private static final Logger log = LoggerFactory.getLogger(ProfileEventListener.class);

	private final EventRepository eventRepository;
	private final ProfileStatusRepository profileStatusRepository;
	private final ProfileStatuses profileStatusCodes;
	private final NotificationService notificationService;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();


	public ProfileEventListener(
			EventRepository eventRepository,
			LookupCodes lookupCodes,
			ProfileStatusRepository profileStatusRepository,
			NotificationService notificationService) {
		this.eventRepository = eventRepository;
		this.profileStatusRepository = profileStatusRepository;
		this.profileStatusCodes = lookupCodes.profileStatuses();
		this.notificationService = notificationService;
	}

	@Async
	@EventListener({ ProfileCreateEvent.class })
	public void handleProfileCreated(ProfileCreateEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("PROFILE_CREATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile created - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ ProfileReadEvent.class })
	public void handleProfileRead(ProfileReadEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("PROFILE_READ")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profiles read - Entra ID: {}, count: {}", event.entraId(), event.profileIds().size());
	}

	@Async
	@EventListener({ ProfileUpdatedEvent.class })
	public void handleProfileUpdated(ProfileUpdatedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("PROFILE_UPDATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile updated - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ ProfileStatusChangeEvent.class })
	public void handleProfileStatusChange(ProfileStatusChangeEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("PROFILE_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile status changed - ID: {}, from status ID: {}, to status ID: {}",
			event.entity().getId(), event.previousStatusId(), event.newStatusId());

		final var profile = event.entity();
		final var newStatus = profile.getProfileStatus();
		final var previousStatus = profileStatusRepository.findById(event.previousStatusId()).orElse(null);

		final var hasNewStatus = newStatus != null;
		final var hasPreviousStatus = previousStatus != null;

		final var newStatusIsApproved = hasNewStatus && isApproved(newStatus);
		final var newStatusIsPending = hasNewStatus && isPending(newStatus);
		final var previousStatusWasIncompleteOrApproved = hasPreviousStatus && (isIncomplete(previousStatus) || isApproved(previousStatus));

		if (newStatusIsApproved) {
			sendApprovalNotification(profile);
		}
		else if (previousStatusWasIncompleteOrApproved && newStatusIsPending) {
			sendPendingNotificationToHrAdvisor(profile);
		}
	}

	private boolean isApproved(ProfileStatusEntity newStatus) {
		return profileStatusCodes.approved().equals(newStatus.getCode());
	}

	private boolean isIncomplete(ProfileStatusEntity previousStatus) {
		return profileStatusCodes.incomplete().equals(previousStatus.getCode());
	}

	private boolean isPending(ProfileStatusEntity previousStatus) {
		return profileStatusCodes.pending().equals(previousStatus.getCode());
	}

	private void sendApprovalNotification(ProfileEntity profile) {
		Optional.ofNullable(profile.getUser())
			.map(UserEntity::getBusinessEmailAddress)
			.ifPresentOrElse(email -> {
				final var profileId = profile.getId().toString();
				final var user = profile.getUser();
				final var name = String.format("%s %s", user.getFirstName(), user.getLastName());

				notificationService.sendEmailNotification(email, profileId, name, ProfileStatus.APPROVED);
			}, () -> log.warn("Could not send approval notification - no email address found for profile ID: {}", profile.getId()));
	}

	private void sendPendingNotificationToHrAdvisor(ProfileEntity profile) {
		Optional.ofNullable(profile.getHrAdvisor())
			.map(UserEntity::getBusinessEmailAddress)
			.ifPresentOrElse(email -> {
				final var profileId = profile.getId().toString();
				final var user = profile.getUser();
				final var name = String.format("%s %s", user.getFirstName(), user.getLastName());

				notificationService.sendEmailNotification(email, profileId, name, ProfileStatus.PENDING);
			}, () -> log.warn("Could not send pending notification - no HR advisor found for profile ID: {}", profile.getId()));
	}
}
