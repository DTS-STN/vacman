package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.UserEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is deleted.
 */
@RecordBuilder
public record UserDeletedEvent(UserEventDto dto, Instant timestamp) {

	public UserDeletedEvent(UserEventDto dto) {
		this(dto, Instant.now());
	}

}