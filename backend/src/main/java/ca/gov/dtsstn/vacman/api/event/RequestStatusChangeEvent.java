package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request's status is changed.
 */
@RecordBuilder
public record RequestStatusChangeEvent(RequestEventDto dto, String previousStatusCode, String newStatusCode, Instant timestamp) {

	public RequestStatusChangeEvent(RequestEventDto dto, String previousStatusCode, String newStatusCode) {
		this(dto, previousStatusCode, newStatusCode, Instant.now());
	}

}
