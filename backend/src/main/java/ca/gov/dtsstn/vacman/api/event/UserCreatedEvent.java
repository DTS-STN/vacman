package ca.gov.dtsstn.vacman.api.event;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

import java.io.Serializable;
import java.time.Instant;

/**
 * Event that is published when a user is created.
 */
public class UserCreatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private final UserEntity entity;
    private final Instant timestamp;

    public UserCreatedEvent(UserEntity entity) {
        this.entity = entity;
        this.timestamp = Instant.now();
    }

    public UserEntity getEntity() {
        return entity;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
