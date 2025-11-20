package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.UserEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is updated.
 */
@RecordBuilder
public record UserUpdatedEvent(UserEventDto dto, Instant timestamp) {

	public UserUpdatedEvent(UserEventDto dto) {
		this(dto, Instant.now());
	}

}