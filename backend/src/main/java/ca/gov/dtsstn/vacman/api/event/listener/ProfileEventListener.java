package ca.gov.dtsstn.vacman.api.event.listener;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.ProfileStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;
import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDto;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Listener for profile-related events.
 */
@Component
public class ProfileEventListener {

	private static final Logger log = LoggerFactory.getLogger(ProfileEventListener.class);

	private final EventRepository eventRepository;
	private final LookupCodes lookupCodes;
	private final ProfileStatusRepository profileStatusRepository;
	private final ProfileStatuses profileStatusCodes;
	private final NotificationService notificationService;

	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	public ProfileEventListener(
			EventRepository eventRepository,
			LookupCodes lookupCodes,
			ProfileStatusRepository profileStatusRepository,
			NotificationService notificationService) {
		this.eventRepository = eventRepository;
		this.lookupCodes = lookupCodes;
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

		log.info("Event: profile created - ID: {}", event.dto().id());
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

		log.info("Event: profile updated - ID: {}", event.dto().id());
	}

	@Async
	@EventListener({ ProfileStatusChangeEvent.class })
	public void handleProfileStatusChange(ProfileStatusChangeEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("PROFILE_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile status changed - ID: {}, from status ID: {}, to status ID: {}",
			event.dto().id(), event.previousStatusId(), event.newStatusId());

		final var profile = event.dto();
		final var newStatus = profileStatusRepository.findById(event.newStatusId()).orElse(null);
		final var previousStatus = profileStatusRepository.findById(event.previousStatusId()).orElse(null);

		final var hasNewStatus = newStatus != null;
		final var hasPreviousStatus = previousStatus != null;

		final var newStatusIsApproved = hasNewStatus && isApproved(newStatus);
		final var newStatusIsPending = hasNewStatus && isPending(newStatus);
		final var newStatusIsArchived = hasNewStatus && isArchived(newStatus);
		final var previousStatusWasIncompleteOrApproved = hasPreviousStatus && (isIncomplete(previousStatus) || isApproved(previousStatus));

		if (newStatusIsApproved) {
			sendApprovalNotification(profile);
		}
		else if (previousStatusWasIncompleteOrApproved && newStatusIsPending) {
			sendPendingNotificationToHrAdvisor(profile);
		}
		else if (newStatusIsArchived) {
			sendArchivedNotification(profile);
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

	private boolean isArchived(ProfileStatusEntity newStatus) {
		return profileStatusCodes.archived().equals(newStatus.getCode());
	}

	private void sendApprovalNotification(ProfileEventDto profile) {
		final var profileId = profile.id().toString();
		final var firstName = Optional.ofNullable(profile.userFirstName()).orElse("");
		final var lastName = Optional.ofNullable(profile.userLastName()).orElse("");
		final var rawName = (firstName + " " + lastName).trim();
		final var name = rawName.isEmpty() ? "Unknown User" : rawName;
		final var language = Optional.ofNullable(profile.languageOfCorrespondenceCode()).orElse(lookupCodes.languages().english());

		// Gather available emails
		final var emails = Optional.ofNullable(profile.userEmails()).orElse(List.of());

		if (!emails.isEmpty()) {
			notificationService.sendProfileNotification(emails, profileId, name, language, ProfileStatus.APPROVED);
		} else {
			log.warn("Could not send approval notification - no email addresses found for profile ID: {}", profile.id());
		}
	}

	private void sendPendingNotificationToHrAdvisor(ProfileEventDto profile) {
		Optional.ofNullable(profile.hrAdvisorEmail()).ifPresentOrElse(email -> {
			final var profileId = profile.id().toString();
			final var firstName = Optional.ofNullable(profile.userFirstName()).orElse("");
			final var lastName = Optional.ofNullable(profile.userLastName()).orElse("");
			final var rawName = (firstName + " " + lastName).trim();
			final var name = rawName.isEmpty() ? "Unknown User" : rawName;
			final var language = Optional.ofNullable(profile.userLanguageCode()).orElse(lookupCodes.languages().english());

			notificationService.sendProfileNotification(email, profileId, name, language, ProfileStatus.PENDING);
		}, () -> log.warn("Could not send pending notification - no HR advisor found for profile ID: {}", profile.id()));
	}

	private void sendArchivedNotification(ProfileEventDto profile) {
		final var profileId = profile.id().toString();
		final var firstName = Optional.ofNullable(profile.userFirstName()).orElse("");
		final var lastName = Optional.ofNullable(profile.userLastName()).orElse("");
		final var rawName = (firstName + " " + lastName).trim();
		final var name = rawName.isEmpty() ? "Unknown User" : rawName;
		final var language = Optional.ofNullable(profile.languageOfCorrespondenceCode()).orElse(lookupCodes.languages().english());

		// Gather all available emails: personal email, business email, and HR advisor email
		final var profileOwnerEmails = Optional.ofNullable(profile.userEmails()).orElse(List.of());
		final var hrAdvisorEmail = profile.hrAdvisorEmail();

		// Send notification to profile owner (personal and business emails)
		if (!profileOwnerEmails.isEmpty()) {
			notificationService.sendProfileNotification(profileOwnerEmails, profileId, name, language, ProfileStatus.ARCHIVED);
			log.info("Archived notification sent to profile owner emails for profile ID: {}", profile.id());
		} else {
			log.warn("Could not send archived notification to profile owner - no email addresses found for profile ID: {}", profile.id());
		}

		// Send notification to HR advisor
		if (hrAdvisorEmail != null) {
			notificationService.sendProfileNotification(hrAdvisorEmail, profileId, name, language, ProfileStatus.ARCHIVED);
			log.info("Archived notification sent to HR advisor for profile ID: {}", profile.id());
		} else {
			log.warn("Could not send archived notification to HR advisor - no HR advisor found for profile ID: {}", profile.id());
		}
	}
}
