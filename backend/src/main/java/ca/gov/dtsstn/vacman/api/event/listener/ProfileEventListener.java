package ca.gov.dtsstn.vacman.api.event.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
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
	private final NotificationService notificationService;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();

	public ProfileEventListener(
			EventRepository eventRepository,
			ProfileStatusRepository profileStatusRepository,
			NotificationService notificationService) {
		this.eventRepository = eventRepository;
		this.profileStatusRepository = profileStatusRepository;
		this.notificationService = notificationService;
	}

	@Async
	@EventListener({ ProfileCreateEvent.class })
	public void handleProfileCreated(ProfileCreateEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.type("PROFILE_CREATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile created - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ ProfileReadEvent.class })
	public void handleProfileRead(ProfileReadEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.type("PROFILE_READ")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profiles read - Entra ID: {}, count: {}", event.entraId(), event.profileIds().size());
	}

	@Async
	@EventListener({ ProfileUpdatedEvent.class })
	public void handleProfileUpdated(ProfileUpdatedEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.type("PROFILE_UPDATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile updated - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ ProfileStatusChangeEvent.class })
	public void handleProfileStatusChange(ProfileStatusChangeEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.type("PROFILE_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: profile status changed - ID: {}, from status ID: {}, to status ID: {}", 
			event.entity().getId(), event.previousStatusId(), event.newStatusId());

		// Check if the profile status was changed to APPROVED
		ProfileEntity profile = event.entity();
		ProfileStatusEntity newStatus = profile.getProfileStatus();

		if (newStatus != null && AppConstants.ProfileStatusCodes.APPROVED.equals(newStatus.getCode())) {
			sendApprovalNotification(profile);
		}
	}

	private void sendApprovalNotification(ProfileEntity profile) {
		try {
			String email = profile.getUser().getBusinessEmailAddress();

			if (email != null && !email.isEmpty()) {
				String profileId = profile.getId().toString();
				String username = profile.getUser().getFirstName() + " " + profile.getUser().getLastName();

				// Send the notification
				notificationService.sendEmailNotification(
					email, 
					profileId, 
					username, 
					ProfileStatus.APPROVED
				);

				log.info("Approval notification sent to user with email: {}, profile ID: {}", email, profileId);
			} else {
				log.warn("Could not send approval notification - no email address found for profile ID: {}", profile.getId());
			}
		} catch (Exception e) {
			log.error("Error sending approval notification for profile ID: {}", profile.getId(), e);
		}
	}
}
