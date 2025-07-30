package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is created.
 */
@RecordBuilder
public record UserCreatedEvent(UserEntity entity, Instant timestamp) {

	public UserCreatedEvent(UserEntity entity) {
		this(entity, Instant.now());
	}

}
