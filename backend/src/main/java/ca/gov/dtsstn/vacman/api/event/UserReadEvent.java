package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is read.
 */
@RecordBuilder
public record UserReadEvent(UserEntity entity, Instant timestamp) {

	public UserReadEvent(UserEntity entity) {
		this(entity, Instant.now());
	}

}
