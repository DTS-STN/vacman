package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is submitted.
 */
@RecordBuilder
public record RequestSubmittedEvent(RequestEventDto dto, String previousStatusCode, String newStatusCode, Instant timestamp) {

	public RequestSubmittedEvent(RequestEventDto dto, String previousStatusCode, String newStatusCode) {
		this(dto, previousStatusCode, newStatusCode, Instant.now());
	}

}