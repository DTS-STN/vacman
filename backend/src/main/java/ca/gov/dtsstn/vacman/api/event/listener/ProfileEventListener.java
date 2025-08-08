package ca.gov.dtsstn.vacman.api.event.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;

/**
 * Listener for profile-related events.
 */
@Component
public class ProfileEventListener {

	private static final Logger log = LoggerFactory.getLogger(ProfileEventListener.class);

	private final EventRepository eventRepository;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();

	public ProfileEventListener(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
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
}
