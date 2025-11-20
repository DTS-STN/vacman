package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.UserEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is created.
 */
@RecordBuilder
public record UserCreatedEvent(UserEventDto dto, Instant timestamp) {

	public UserCreatedEvent(UserEventDto dto) {
		this(dto, Instant.now());
	}

}
