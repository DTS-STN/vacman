package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is completed (PSC clearance granted).
 */
@RecordBuilder
public record RequestCompletedEvent(RequestEventDto dto, Instant timestamp) {

	public RequestCompletedEvent(RequestEventDto dto) {
		this(dto, Instant.now());
	}

}
