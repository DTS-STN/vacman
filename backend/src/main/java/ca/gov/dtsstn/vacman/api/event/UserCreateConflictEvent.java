package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.UserEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user creation conflicts with an existing user.
 */
@RecordBuilder
public record UserCreateConflictEvent(UserEventDto dto, Instant timestamp) {

	public UserCreateConflictEvent(UserEventDto dto) {
		this(dto, Instant.now());
	}

}