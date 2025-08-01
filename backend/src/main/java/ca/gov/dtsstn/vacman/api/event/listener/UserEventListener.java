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
import ca.gov.dtsstn.vacman.api.event.UserCreateConflictEvent;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;

@Component
public class UserEventListener {

	private static final Logger log = LoggerFactory.getLogger(UserEventListener.class);

	private final EventRepository eventRepository;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();

	public UserEventListener(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}

	@Async
	@EventListener({ UserCreatedEvent.class })
	public void handleUserCreated(UserCreatedEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.name("USER_CREATED")
			.description(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: user created - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ UserCreateConflictEvent.class })
	public void handleUserCreateConflict(UserCreateConflictEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.name("USER_CREATE_CONFLICT")
			.description(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: user create conflict - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ UserUpdatedEvent.class })
	public void handleUserUpdated(UserUpdatedEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.name("USER_UPDATED")
			.description("User updated with ID: " + event.entity().getId())
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: user updated - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ UserDeletedEvent.class })
	public void handleUserDeleted(UserDeletedEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.name("USER_DELETED")
			.description("User deleted with ID: " + event.entity().getId())
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: user deleted - ID: {}", event.entity().getId());
	}

	@Async
	@EventListener({ UserReadEvent.class })
	public void handleUserRead(UserReadEvent event) throws JsonProcessingException {
		eventRepository.save(new EventEntityBuilder()
			.name("USER_READ")
			.description("User read with ID: " + event.entity().getId())
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: user read - ID: {}", event.entity().getId());
	}

}
