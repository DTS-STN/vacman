package ca.gov.dtsstn.vacman.api.event.listener;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.event.UserCreateConflictEvent;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class UserEventListener {

    private static final Logger log = LoggerFactory.getLogger(UserEventListener.class);

    private final EventRepository eventRepository;

    private final ObjectMapper objectMapper;

    public UserEventListener(EventRepository eventRepository) {
        Assert.notNull(eventRepository, "eventRepository is required; it must not be null");
        this.eventRepository = eventRepository;

        this.objectMapper = new ObjectMapper()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .findAndRegisterModules();
    }

    @Async
    @EventListener({ UserCreatedEvent.class })
    public void handleUserCreated(UserCreatedEvent event) throws JsonProcessingException {
        EventEntity eventEntity = new EventEntity();
        eventEntity.setEventName("USER_CREATED");
        eventEntity.setEventDescription("User created with ID: " + event.getEntity().getId());
        eventEntity.setEventDetails(objectMapper.writeValueAsString(event));

        eventRepository.save(eventEntity);

        log.info("Event: user created - ID: {}", event.getEntity().getId());
    }

    /**
     * Handles user create conflict events.
     * Logs the event to the database.
     *
     * @param event the user create conflict event
     * @throws JsonProcessingException if there's an error processing the event to JSON
     */
    @Async
    @EventListener({ UserCreateConflictEvent.class })
    public void handleUserCreateConflict(UserCreateConflictEvent event) throws JsonProcessingException {
        EventEntity eventEntity = new EventEntity();
        eventEntity.setEventName("USER_CREATE_CONFLICT");
        eventEntity.setEventDescription("User create conflict with ID: " + event.getEntity().getId());
        eventEntity.setEventDetails(objectMapper.writeValueAsString(event));

        eventRepository.save(eventEntity);

        log.info("Event: user create conflict - ID: {}", event.getEntity().getId());
    }
}
