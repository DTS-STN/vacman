package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user creation conflicts with an existing user.
 */
@RecordBuilder
public record UserCreateConflictEvent(UserEntity entity, Instant timestamp) {

	public UserCreateConflictEvent(UserEntity entity) {
		this(entity, Instant.now());
	}

}